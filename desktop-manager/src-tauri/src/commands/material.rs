use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::Manager;
use tauri_plugin_dialog::DialogExt;

use crate::commands::course::DbState;

fn insert_material(
    conn: &rusqlite::Connection,
    name: String,
    file_path: String,
    file_size: u64,
    course_id: i64,
) -> Result<Material, String> {
    conn.execute(
        "INSERT INTO materials (name, file_path, file_size, course_id) VALUES (?1, ?2, ?3, ?4)",
        [&name, &file_path, &file_size.to_string(), &course_id.to_string()],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    Ok(Material {
        id: Some(id),
        name,
        file_path,
        file_size,
        course_id,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Material {
    pub id: Option<i64>,
    pub name: String,
    pub file_path: String,
    pub file_size: u64,
    pub course_id: i64,
    pub created_at: String,
}

#[command]
pub fn get_materials(db_state: tauri::State<DbState>, course_id: i64) -> Result<Vec<Material>, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, file_path, file_size, course_id, created_at FROM materials WHERE course_id = ?1 ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let materials = stmt
        .query_map([course_id.to_string()], |row| {
            Ok(Material {
                id: row.get(0)?,
                name: row.get(1)?,
                file_path: row.get(2)?,
                file_size: row.get(3)?,
                course_id: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|result| result.ok())
        .collect();

    Ok(materials)
}

#[command]
pub fn upload_material(
    db_state: tauri::State<DbState>,
    name: String,
    file_path: String,
    file_size: u64,
    course_id: i64,
) -> Result<Material, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;
    insert_material(&conn, name, file_path, file_size, course_id)
}

#[command]
pub async fn import_material_for_course(
    app: tauri::AppHandle,
    db_state: tauri::State<'_, DbState>,
    course_id: i64,
    display_name: Option<String>,
) -> Result<Material, String> {
    let picked = app
        .dialog()
        .file()
        .add_filter(
            "课件文件",
            &[
                "pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "zip", "rar", "mp4", "png",
                "jpg", "jpeg", "gif", "txt", "md",
            ],
        )
        .blocking_pick_file();

    let source_path = match picked {
        Some(path) => path.into_path().map_err(|e| e.to_string())?,
        None => return Err("未选择文件".to_string()),
    };

    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    let course_dir = data_dir.join("materials").join(course_id.to_string());
    fs::create_dir_all(&course_dir).map_err(|e| format!("创建课件目录失败: {}", e))?;

    let file_name = source_path
        .file_name()
        .ok_or_else(|| "无效文件名".to_string())?
        .to_string_lossy()
        .to_string();

    let dest_path = unique_dest_path(&course_dir, &file_name);
    fs::copy(&source_path, &dest_path).map_err(|e| format!("复制文件失败: {}", e))?;

    let file_size = fs::metadata(&dest_path)
        .map(|meta| meta.len())
        .unwrap_or(0);

    let material_name = display_name
        .filter(|name| !name.trim().is_empty())
        .unwrap_or_else(|| file_name.clone());

    let conn = db_state.lock().map_err(|e| e.to_string())?;
    insert_material(
        &conn,
        material_name,
        dest_path.to_string_lossy().to_string(),
        file_size,
        course_id,
    )
}

fn unique_dest_path(dir: &Path, file_name: &str) -> PathBuf {
    let mut dest = dir.join(file_name);
    if !dest.exists() {
        return dest;
    }

    let path = Path::new(file_name);
    let stem = path
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "file".to_string());
    let ext = path
        .extension()
        .map(|s| format!(".{}", s.to_string_lossy()))
        .unwrap_or_default();

    let mut index = 1;
    loop {
        dest = dir.join(format!("{} ({}){}", stem, index, ext));
        if !dest.exists() {
            return dest;
        }
        index += 1;
    }
}

#[command]
pub fn delete_material(db_state: tauri::State<DbState>, id: i64) -> Result<(), String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM materials WHERE id = ?1", [&id.to_string()])
        .map_err(|e| e.to_string())?;

    Ok(())
}
