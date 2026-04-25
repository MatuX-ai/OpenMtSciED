use serde::{Deserialize, Serialize};
use tauri::command;
use crate::commands::course::DbState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserProject {
    pub id: Option<i64>,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectResourceLink {
    pub project_id: i64,
    pub resource_id: String,
}

/// 创建用户项目
#[command]
pub fn create_user_project(
    db_state: tauri::State<'_, DbState>,
    name: String,
    description: Option<String>,
) -> Result<UserProject, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO user_projects (name, description) VALUES (?1, ?2)",
        rusqlite::params![&name, &description],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    Ok(UserProject {
        id: Some(id),
        name,
        description,
        created_at: chrono::Utc::now().to_rfc3339(),
    })
}

/// 获取所有用户项目
#[command]
pub fn get_user_projects(db_state: tauri::State<'_, DbState>) -> Result<Vec<UserProject>, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, description, created_at FROM user_projects ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let projects = stmt
        .query_map([], |row| {
            Ok(UserProject {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                created_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|result| result.ok())
        .collect();

    Ok(projects)
}

/// 将资源添加到项目
#[command]
pub fn add_resource_to_project(
    db_state: tauri::State<'_, DbState>,
    link: ProjectResourceLink,
) -> Result<(), String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO project_resources (project_id, resource_id) VALUES (?1, ?2)",
        rusqlite::params![&link.project_id, &link.resource_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// 获取项目中的资源列表
#[command]
pub fn get_project_resources(
    db_state: tauri::State<'_, DbState>,
    project_id: i64,
) -> Result<Vec<crate::commands::resource::OpenResource>, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT r.id, r.title, r.description, r.source, r.subject, r.level, r.difficulty,
         r.has_hardware, r.hardware_budget, r.download_url, r.thumbnail,
         r.detailed_description, r.learning_objectives, r.materials_list,
         r.estimated_duration, r.is_downloaded, r.local_content_path
         FROM open_resources r
         INNER JOIN project_resources pr ON r.id = pr.resource_id
         WHERE pr.project_id = ?1"
    ).map_err(|e| e.to_string())?;

    let resources = stmt
        .query_map([&project_id.to_string()], |row| {
            let learning_objectives: String = row.get(12)?;
            let materials_list: String = row.get(13)?;

            Ok(crate::commands::resource::OpenResource {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                source: row.get(3)?,
                subject: row.get(4)?,
                level: row.get(5)?,
                difficulty: row.get(6)?,
                has_hardware: row.get::<_, i32>(7)? == 1,
                hardware_budget: row.get::<_, Option<i32>>(8)?.map(|v| v as u32),
                download_url: {
                    let url: String = row.get(9)?;
                    if url.is_empty() { None } else { Some(url) }
                },
                thumbnail: {
                    let thumb: String = row.get(10)?;
                    if thumb.is_empty() { None } else { Some(thumb) }
                },
                detailed_description: {
                    let desc: String = row.get(11)?;
                    if desc.is_empty() { None } else { Some(desc) }
                },
                learning_objectives: if !learning_objectives.is_empty() {
                    serde_json::from_str(&learning_objectives).ok()
                } else {
                    None
                },
                materials_list: if !materials_list.is_empty() {
                    serde_json::from_str(&materials_list).ok()
                } else {
                    None
                },
                estimated_duration: {
                    let duration: String = row.get(14)?;
                    if duration.is_empty() { None } else { Some(duration) }
                },
                is_downloaded: Some(row.get::<_, i32>(15)? == 1),
                local_content_path: {
                    let path: String = row.get(16)?;
                    if path.is_empty() { None } else { Some(path) }
                },
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|result| result.ok())
        .collect();

    Ok(resources)
}
