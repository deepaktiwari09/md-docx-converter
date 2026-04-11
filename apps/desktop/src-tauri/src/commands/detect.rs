use std::process::Command;
use std::sync::OnceLock;

/// Cached mmdc (Mermaid CLI) availability check.
/// Checked once per app session via OnceLock — no repeated process spawns.
static MMDC_AVAILABLE: OnceLock<bool> = OnceLock::new();

pub fn is_mmdc_available() -> bool {
    *MMDC_AVAILABLE.get_or_init(|| {
        Command::new("mmdc")
            .arg("--version")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
    })
}

/// Open a file with the system's default application.
#[tauri::command]
pub async fn open_file(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", &path])
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open file: {}", e))?;
    }

    Ok(())
}

/// Delete a file from the filesystem.
#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {
    std::fs::remove_file(&path).map_err(|e| format!("Failed to delete file: {}", e))
}
