use crate::commands::detect::is_mmdc_available;
use crate::pandoc::{get_pandoc_path, get_resource_dir, run_conversion, run_conversion_with_args, ConversionArgs};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversionResult {
    pub input: String,
    pub output: String,
    pub success: bool,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn convert_md_to_docx(
    app_handle: AppHandle,
    input_path: String,
    output_path: String,
) -> Result<ConversionResult, String> {
    let pandoc = get_pandoc_path(&app_handle)?;
    let resource_dir = get_resource_dir(&app_handle)?;
    let mmdc = is_mmdc_available();
    let extra_args = ConversionArgs::build_for_md_to_docx(&resource_dir, &input_path, mmdc);

    match run_conversion_with_args(&pandoc, &input_path, &output_path, "markdown", "docx", &extra_args) {
        Ok(()) => Ok(ConversionResult {
            input: input_path,
            output: output_path,
            success: true,
            error: None,
        }),
        Err(e) => Ok(ConversionResult {
            input: input_path,
            output: output_path,
            success: false,
            error: Some(e),
        }),
    }
}

#[tauri::command]
pub async fn convert_docx_to_md(
    app_handle: AppHandle,
    input_path: String,
    output_path: String,
) -> Result<ConversionResult, String> {
    let pandoc = get_pandoc_path(&app_handle)?;

    match run_conversion(&pandoc, &input_path, &output_path, "docx", "markdown") {
        Ok(()) => Ok(ConversionResult {
            input: input_path,
            output: output_path,
            success: true,
            error: None,
        }),
        Err(e) => Ok(ConversionResult {
            input: input_path,
            output: output_path,
            success: false,
            error: Some(e),
        }),
    }
}

#[tauri::command]
pub async fn convert_batch(
    app_handle: AppHandle,
    files: Vec<String>,
    output_dir: String,
    to_docx: bool,
) -> Result<Vec<ConversionResult>, String> {
    let pandoc = get_pandoc_path(&app_handle)?;
    let mut results = Vec::new();

    let (to_ext, from_format, to_format) = if to_docx {
        ("docx", "markdown", "docx")
    } else {
        ("md", "docx", "markdown")
    };

    // For MD→DOCX: resolve resources + detect mmdc once for the batch
    let enterprise_ctx = if to_docx {
        Some((get_resource_dir(&app_handle)?, is_mmdc_available()))
    } else {
        None
    };

    for input_path in files {
        let input = Path::new(&input_path);
        let stem = input.file_stem().unwrap_or_default().to_string_lossy();
        let output_path = Path::new(&output_dir)
            .join(format!("{}.{}", stem, to_ext))
            .to_string_lossy()
            .to_string();

        let result = if let Some((ref resource_dir, mmdc)) = enterprise_ctx {
            let extra_args = ConversionArgs::build_for_md_to_docx(resource_dir, &input_path, mmdc);
            run_conversion_with_args(&pandoc, &input_path, &output_path, from_format, to_format, &extra_args)
        } else {
            run_conversion(&pandoc, &input_path, &output_path, from_format, to_format)
        };

        match result {
            Ok(()) => results.push(ConversionResult {
                input: input_path,
                output: output_path,
                success: true,
                error: None,
            }),
            Err(e) => results.push(ConversionResult {
                input: input_path,
                output: output_path,
                success: false,
                error: Some(e),
            }),
        }
    }

    Ok(results)
}

#[tauri::command]
pub async fn scan_directory(dir_path: String, extension: String) -> Result<Vec<String>, String> {
    let path = Path::new(&dir_path);

    if !path.is_dir() {
        return Err("Not a valid directory".to_string());
    }

    let mut files = Vec::new();
    scan_dir_recursive(path, &extension, &mut files)?;

    Ok(files)
}

fn scan_dir_recursive(dir: &Path, extension: &str, files: &mut Vec<String>) -> Result<(), String> {
    let entries = fs::read_dir(dir).map_err(|e| e.to_string())?;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_dir() {
            scan_dir_recursive(&path, extension, files)?;
        } else if let Some(ext) = path.extension() {
            if ext.to_string_lossy().to_lowercase() == extension.to_lowercase() {
                files.push(path.to_string_lossy().to_string());
            }
        }
    }

    Ok(())
}
