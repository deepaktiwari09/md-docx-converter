use std::path::PathBuf;
use std::process::Command;
use tauri::{AppHandle, Manager};

pub fn get_pandoc_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    // Try bundled resource first
    if let Ok(resource_dir) = app_handle.path().resource_dir() {
        #[cfg(target_os = "windows")]
        let pandoc = resource_dir.join("pandoc.exe");

        #[cfg(not(target_os = "windows"))]
        let pandoc = resource_dir.join("pandoc");

        if pandoc.exists() {
            return Ok(pandoc);
        }
    }

    // Fallback for development: look in resources/pandoc relative to src-tauri
    let dev_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("resources")
        .join("pandoc");

    #[cfg(target_os = "windows")]
    let pandoc = dev_path.join("pandoc.exe");

    #[cfg(not(target_os = "windows"))]
    let pandoc = dev_path.join("pandoc");

    if pandoc.exists() {
        return Ok(pandoc);
    }

    Err("Pandoc binary not found".to_string())
}

/// Resolve the resource directory containing pandoc binary, reference.docx, and filters/.
/// Production: Tauri resource dir. Dev: resources/pandoc/ relative to src-tauri.
pub fn get_resource_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
    if let Ok(resource_dir) = app_handle.path().resource_dir() {
        let marker = if cfg!(target_os = "windows") {
            resource_dir.join("pandoc.exe")
        } else {
            resource_dir.join("pandoc")
        };
        if marker.exists() {
            return Ok(resource_dir);
        }
    }

    let dev_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("resources")
        .join("pandoc");

    if dev_path.exists() {
        return Ok(dev_path);
    }

    Err("Resource directory not found".to_string())
}

pub fn run_conversion(
    pandoc_path: &PathBuf,
    input_path: &str,
    output_path: &str,
    from_format: &str,
    to_format: &str,
) -> Result<(), String> {
    let status = Command::new(pandoc_path)
        .args(["-f", from_format, "-t", to_format, "-o", output_path, input_path])
        .status()
        .map_err(|e| format!("Failed to execute pandoc: {}", e))?;

    if !status.success() {
        return Err(format!(
            "Pandoc conversion failed with exit code: {:?}",
            status.code()
        ));
    }

    Ok(())
}

/// Enhanced conversion with extra args (template, TOC, Lua filter, etc.).
/// Captures stderr for better error messages.
pub fn run_conversion_with_args(
    pandoc_path: &PathBuf,
    input_path: &str,
    output_path: &str,
    from_format: &str,
    to_format: &str,
    extra_args: &[String],
) -> Result<(), String> {
    let mut cmd = Command::new(pandoc_path);
    cmd.args(["-f", from_format, "-t", to_format, "-o", output_path]);

    for arg in extra_args {
        cmd.arg(arg);
    }

    // Input file must come last (after all flags)
    cmd.arg(input_path);

    let output = cmd
        .output()
        .map_err(|e| format!("Failed to execute pandoc: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!(
            "Pandoc conversion failed (exit {}): {}",
            output.status.code().unwrap_or(-1),
            stderr.trim()
        ));
    }

    Ok(())
}
