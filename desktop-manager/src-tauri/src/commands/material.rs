use serde::{Deserialize, Serialize};
use tauri::command;
use crate::commands::course::DbState;

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

#[command]
pub fn delete_material(db_state: tauri::State<DbState>, id: i64) -> Result<(), String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM materials WHERE id = ?1", [&id.to_string()])
        .map_err(|e| e.to_string())?;

    Ok(())
}
