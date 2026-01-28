mod commands;
mod pandoc;

use commands::{convert_batch, convert_docx_to_md, convert_md_to_docx, scan_directory};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            convert_md_to_docx,
            convert_docx_to_md,
            convert_batch,
            scan_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
