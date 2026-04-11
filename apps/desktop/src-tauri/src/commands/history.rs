use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const MAX_HISTORY_ENTRIES: usize = 1000;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: String,
    pub input_path: String,
    pub output_path: String,
    pub direction: String,
    pub success: bool,
    pub error: Option<String>,
    pub timestamp: String,
    pub input_filename: String,
    pub output_filename: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct HistoryFile {
    version: u32,
    entries: Vec<HistoryEntry>,
}

impl HistoryFile {
    fn empty() -> Self {
        Self {
            version: 1,
            entries: Vec::new(),
        }
    }
}

fn history_path(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app data dir: {}", e))?;
    Ok(data_dir.join("history.json"))
}

fn read_history_file(path: &PathBuf) -> HistoryFile {
    match fs::read_to_string(path) {
        Ok(content) => serde_json::from_str(&content).unwrap_or_else(|_| HistoryFile::empty()),
        Err(_) => HistoryFile::empty(),
    }
}

fn write_history_file(path: &PathBuf, history: &HistoryFile) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create data dir: {}", e))?;
    }
    let tmp = path.with_extension("json.tmp");
    let json =
        serde_json::to_string_pretty(history).map_err(|e| format!("Failed to serialize: {}", e))?;
    fs::write(&tmp, json).map_err(|e| format!("Failed to write history: {}", e))?;
    fs::rename(&tmp, path).map_err(|e| format!("Failed to save history: {}", e))?;
    Ok(())
}

fn generate_id() -> String {
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    let millis = duration.as_millis();
    let nanos = duration.subsec_nanos();
    format!("{}-{:06x}", millis, nanos & 0xFFFFFF)
}

#[tauri::command]
pub async fn load_history(app_handle: AppHandle) -> Result<Vec<HistoryEntry>, String> {
    let path = history_path(&app_handle)?;
    let history = read_history_file(&path);
    Ok(history.entries)
}

#[tauri::command]
pub async fn save_history_entry(
    app_handle: AppHandle,
    mut entry: HistoryEntry,
) -> Result<HistoryEntry, String> {
    let path = history_path(&app_handle)?;
    let mut history = read_history_file(&path);

    entry.id = generate_id();
    history.entries.insert(0, entry.clone());
    history.entries.truncate(MAX_HISTORY_ENTRIES);

    write_history_file(&path, &history)?;
    Ok(entry)
}

#[tauri::command]
pub async fn delete_history_entry(app_handle: AppHandle, id: String) -> Result<(), String> {
    let path = history_path(&app_handle)?;
    let mut history = read_history_file(&path);
    history.entries.retain(|e| e.id != id);
    write_history_file(&path, &history)?;
    Ok(())
}
