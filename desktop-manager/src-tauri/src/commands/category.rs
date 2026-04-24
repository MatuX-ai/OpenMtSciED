use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};

use crate::commands::course::DbState;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub color: String,
    pub icon: String,
    pub sort_order: i64,
    pub created_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct CreateCategoryRequest {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub sort_order: Option<i64>,
}

#[derive(Serialize, Deserialize)]
pub struct UpdateCategoryRequest {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub sort_order: Option<i64>,
}

#[tauri::command]
pub fn get_categories(db_state: tauri::State<DbState>) -> Result<Vec<Category>, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, description, color, icon, sort_order, created_at FROM categories ORDER BY sort_order ASC, name ASC")
        .map_err(|e: rusqlite::Error| e.to_string())?;

    let categories = stmt
        .query_map([], |row: &rusqlite::Row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                color: row.get(3)?,
                icon: row.get(4)?,
                sort_order: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e: rusqlite::Error| e.to_string())?
        .filter_map(|r: Result<Category, rusqlite::Error>| r.ok())
        .collect();

    Ok(categories)
}

#[tauri::command]
pub fn create_category(db_state: tauri::State<DbState>, request: CreateCategoryRequest) -> Result<Category, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let color = request.color.unwrap_or("#6366f1".to_string());
    let icon = request.icon.unwrap_or("folder".to_string());
    let sort_order = request.sort_order.unwrap_or(0);

    conn.execute(
        "INSERT INTO categories (name, description, color, icon, sort_order) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![request.name, request.description, color, icon, sort_order],
    )
    .map_err(|e: rusqlite::Error| e.to_string())?;

    let id = conn.last_insert_rowid();

    Ok(Category {
        id,
        name: request.name,
        description: request.description,
        color,
        icon,
        sort_order,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

#[tauri::command]
pub fn update_category(db_state: tauri::State<DbState>, request: UpdateCategoryRequest) -> Result<Category, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let category = conn
        .query_row(
            "SELECT id, name, description, color, icon, sort_order, created_at FROM categories WHERE id = ?1",
            rusqlite::params![request.id],
            |row: &rusqlite::Row| {
                Ok(Category {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    description: row.get(2)?,
                    color: row.get(3)?,
                    icon: row.get(4)?,
                    sort_order: row.get(5)?,
                    created_at: row.get(6)?,
                })
            },
        )
        .map_err(|e: rusqlite::Error| e.to_string())?;

    conn.execute(
        "UPDATE categories SET name = ?1, description = ?2, color = ?3, icon = ?4, sort_order = ?5 WHERE id = ?6",
        rusqlite::params![
            request.name,
            request.description,
            request.color.as_ref().unwrap_or(&category.color),
            request.icon.as_ref().unwrap_or(&category.icon),
            request.sort_order.unwrap_or(category.sort_order),
            request.id
        ],
    )
    .map_err(|e: rusqlite::Error| e.to_string())?;

    Ok(Category {
        id: request.id,
        name: request.name,
        description: request.description,
        color: request.color.unwrap_or(category.color.clone()),
        icon: request.icon.unwrap_or(category.icon.clone()),
        sort_order: request.sort_order.unwrap_or(category.sort_order),
        created_at: category.created_at,
    })
}

#[tauri::command]
pub fn delete_category(db_state: tauri::State<DbState>, id: i64) -> Result<(), String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    // 先将属于该分类的课程设置为未分类
    conn.execute(
        "UPDATE courses SET category_id = NULL, category = '未分类' WHERE category_id = ?1",
        rusqlite::params![id],
    )
    .map_err(|e: rusqlite::Error| e.to_string())?;

    // 删除分类
    conn.execute("DELETE FROM categories WHERE id = ?1", rusqlite::params![id])
        .map_err(|e: rusqlite::Error| e.to_string())?;

    Ok(())
}
