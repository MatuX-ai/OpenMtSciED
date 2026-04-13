use serde::{Deserialize, Serialize};
use tauri::command;
use rusqlite::Connection;
use std::sync::{Arc, Mutex};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Course {
    pub id: Option<i64>,
    pub name: String,
    pub description: String,
    pub category: String,
    pub created_at: String,
}

pub type DbState = Arc<Mutex<Connection>>;

#[command]
pub fn get_courses(db_state: tauri::State<DbState>) -> Result<Vec<Course>, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, description, category, created_at FROM courses ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let courses = stmt
        .query_map([], |row| {
            Ok(Course {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                category: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|result| result.ok())
        .collect();

    Ok(courses)
}

#[command]
pub fn create_course(
    db_state: tauri::State<DbState>,
    name: String,
    description: String,
    category: String,
) -> Result<Course, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO courses (name, description, category) VALUES (?1, ?2, ?3)",
        [&name, &description, &category],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    Ok(Course {
        id: Some(id),
        name,
        description,
        category,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[command]
pub fn update_course(
    db_state: tauri::State<DbState>,
    id: i64,
    name: String,
    description: String,
    category: String,
) -> Result<Course, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE courses SET name = ?1, description = ?2, category = ?3 WHERE id = ?4",
        [&name, &description, &category, &id.to_string()],
    )
    .map_err(|e| e.to_string())?;

    Ok(Course {
        id: Some(id),
        name,
        description,
        category,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[command]
pub fn delete_course(db_state: tauri::State<DbState>, id: i64) -> Result<(), String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM courses WHERE id = ?1", [&id.to_string()])
        .map_err(|e| e.to_string())?;

    Ok(())
}
