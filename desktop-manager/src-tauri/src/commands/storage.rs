use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::command;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct StorageInfo {
    pub data_path: String,
    pub database_path: String,
    pub materials_path: String,
    pub total_space: u64,
    pub free_space: u64,
    pub used_space: u64,
    pub material_count: i64,
    pub estimated_growth: String,
}

fn format_bytes(bytes: u64) -> String {
    if bytes == 0 {
        return "0 B".to_string();
    }
    let k = 1024.0;
    let sizes = ["B", "KB", "MB", "GB", "TB"];
    let i = (bytes as f64).log(k).floor() as usize;
    let size = bytes as f64 / k.powi(i as i32);
    format!("{:.2} {}", size, sizes[i])
}

#[command]
pub fn get_storage_info(app_handle: tauri::AppHandle, db_state: tauri::State<crate::commands::course::DbState>) -> Result<StorageInfo, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    // 计算材料总数
    let material_count: i64 = conn
        .query_row("SELECT COUNT(*) FROM materials", [], |row| row.get(0))
        .unwrap_or(0);

    // 计算已用空间
    let used_space: u64 = conn
        .query_row("SELECT COALESCE(SUM(file_size), 0) FROM materials", [], |row| row.get(0))
        .unwrap_or(0);

    // 获取应用数据路径
    let data_path = app_handle
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."));

    // 获取可用磁盘空间
    let free_space = fs2::available_space(&data_path).unwrap_or(0);

    // 获取磁盘总空间 (Windows 使用 GetDiskFreeSpaceEx, 这里简化为 free + used)
    let total_space = free_space + used_space;

    // 估算增长（假设平均每课件 10MB）
    let estimated = material_count as f64 * 10.0;
    let estimated_growth = format_bytes(estimated as u64 * 1024 * 1024);

    Ok(StorageInfo {
        data_path: data_path.to_string_lossy().to_string(),
        database_path: data_path.join("openmtscied.db").to_string_lossy().to_string(),
        materials_path: data_path.join("materials").to_string_lossy().to_string(),
        total_space,
        free_space,
        used_space,
        material_count,
        estimated_growth,
    })
}

#[command]
pub fn get_folder_size(path: String) -> Result<u64, String> {
    let path = PathBuf::from(path);

    if !path.exists() {
        return Ok(0);
    }

    let mut total_size = 0u64;

    for entry in walkdir::WalkDir::new(&path).into_iter().filter_map(|e| e.ok()) {
        if entry.file_type().is_file() {
            if let Ok(metadata) = entry.metadata() {
                total_size += metadata.len();
            }
        }
    }

    Ok(total_size)
}
