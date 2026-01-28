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
