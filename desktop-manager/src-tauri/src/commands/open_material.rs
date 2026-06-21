use serde::{Deserialize, Serialize};
use tauri::command;
use tauri::Manager;
use crate::commands::course::DbState;
use std::fs;

/// 内嵌的开源课件 JSON 数据（构建时嵌入二进制，保证已安装应用总能访问）
const EMBEDDED_OPEN_MATERIALS_JSON: &str = include_str!("../../data/open_materials.json");

/// 尝试解析 open_materials.json 路径并返回内容
/// 支持多个备选路径，依次尝试：
/// 1. Tauri 资源目录（已安装应用的打包资源）
/// 2. EXE 同级目录的 data/open_materials.json
/// 3. 当前工作目录的 data/open_materials.json
/// 4. 开发环境相对路径（src-tauri/data/open_materials.json）
/// 5. 内嵌的默认数据（兜底，任何情况下都能返回）
fn read_open_materials_json(_app: &tauri::AppHandle) -> Result<String, String> {
    let file_name = "open_materials.json";

    let mut candidates: Vec<std::path::PathBuf> = Vec::new();

    // 1. Tauri 资源目录
    if let Ok(resource_dir) = _app.path().resource_dir() {
        candidates.push(resource_dir.join(file_name));
        candidates.push(resource_dir.join("data").join(file_name));
    }

    // 2. EXE 同级目录
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            candidates.push(exe_dir.join(file_name));
            candidates.push(exe_dir.join("data").join(file_name));
            candidates.push(exe_dir.join("resources").join(file_name));
        }
    }

    // 3. 当前工作目录
    if let Ok(cwd) = std::env::current_dir() {
        candidates.push(cwd.join("data").join(file_name));
        candidates.push(cwd.join(file_name));
    }

    for candidate in &candidates {
        if candidate.exists() {
            return fs::read_to_string(candidate).map_err(|e| {
                format!("Failed to read {} from {}: {}", file_name, candidate.display(), e)
            });
        }
    }

    // 4. 兜底：使用构建时嵌入的数据
    println!(
        "ℹ {} not found on disk, using embedded fallback data",
        file_name
    );
    Ok(EMBEDDED_OPEN_MATERIALS_JSON.to_string())
}

/// 开源课件元数据
#[derive(Serialize, Deserialize, Clone)]
pub struct OpenMaterial {
    pub id: String,
    pub title: String,
    pub description: String,
    pub source: String,
    pub material_type: String,
    pub subject: String,
    pub level: String,
    pub file_size: Option<String>,
    pub duration: Option<String>,
    pub download_url: Option<String>,
    pub preview_url: Option<String>,
    pub thumbnail: Option<String>,
    pub detailed_description: Option<String>,
    pub learning_objectives: Option<Vec<String>>,
    pub language: Option<String>,
    pub license: Option<String>,
    pub estimated_duration: Option<String>,
    pub is_downloaded: Option<bool>,
    pub local_path: Option<String>,
}

/// 课件查询参数
#[derive(Serialize, Deserialize)]
pub struct MaterialQuery {
    pub source: Option<String>,
    pub subject: Option<String>,
    pub level: Option<String>,
    pub material_type: Option<String>,
    pub keyword: Option<String>,
    pub page: usize,
    pub page_size: usize,
}

/// 分页结果
#[derive(Serialize, Deserialize)]
pub struct PaginatedMaterials {
    pub items: Vec<OpenMaterial>,
    pub total: usize,
    pub page: usize,
    pub page_size: usize,
    pub total_pages: usize,
}

/// 从 JSON 文件导入开源课件到数据库（首次启动时调用）
#[command]
pub fn import_open_materials_from_json(
    app: tauri::AppHandle,
    db_state: tauri::State<DbState>,
) -> Result<usize, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let json_content = read_open_materials_json(&app)?;

    let all: serde_json::Value = serde_json::from_str(&json_content)
        .map_err(|e| format!("Failed to parse open_materials: {}", e))?;

    let mut imported = 0usize;

    for src in &["openstax", "ted-ed", "phetsim"] {
        if let Some(items) = all["sources"][src].as_array() {
            for v in items {
                let id = v["id"].as_str().unwrap_or("").to_string();
                if id.is_empty() {
                    continue;
                }

                // 检查是否已存在
                let exists: bool = conn
                    .query_row(
                        "SELECT COUNT(*) FROM open_materials WHERE id = ?1",
                        [&id],
                        |row| row.get(0),
                    )
                    .unwrap_or(0)
                    > 0;

                if exists {
                    continue;
                }

                let title = v["title"].as_str().unwrap_or("").to_string();
                let description = v["description"].as_str().unwrap_or("").to_string();
                let source = v["source"].as_str().unwrap_or(src).to_string();
                let material_type = v["type"].as_str().unwrap_or("pdf").to_string();
                let subject = v["subject"].as_str().unwrap_or("").to_string();
                let level = v["level"].as_str().unwrap_or("").to_string();
                let file_size = v["file_size"].as_str().map(|s| s.to_string());
                let duration = v["duration"].as_str().map(|s| s.to_string());
                let download_url = v["download_url"].as_str().map(|s| s.to_string());
                let preview_url = v["preview_url"].as_str().map(|s| s.to_string());
                let thumbnail = v["thumbnail"].as_str().map(|s| s.to_string());
                let detailed_description = v["detailed_description"].as_str().map(|s| s.to_string());
                let language = v["language"].as_str().map(|s| s.to_string());
                let license = v["license"].as_str().map(|s| s.to_string());
                let estimated_duration = v["estimated_duration"].as_str().map(|s| s.to_string());

                let learning_objectives_json = v["learning_objectives"]
                    .as_array()
                    .map(|arr| serde_json::to_string(arr).unwrap_or_default())
                    .unwrap_or_default();

                conn.execute(
                    "INSERT INTO open_materials (
                        id, title, description, source, material_type, subject, level,
                        file_size, duration, download_url, preview_url, thumbnail,
                        detailed_description, learning_objectives, language, license,
                        estimated_duration, is_downloaded
                    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, 0)",
                    rusqlite::params![
                        &id,
                        &title,
                        &description,
                        &source,
                        &material_type,
                        &subject,
                        &level,
                        &file_size.clone().unwrap_or_default(),
                        &duration.clone().unwrap_or_default(),
                        &download_url.clone().unwrap_or_default(),
                        &preview_url.clone().unwrap_or_default(),
                        &thumbnail.clone().unwrap_or_default(),
                        &detailed_description.clone().unwrap_or_default(),
                        &learning_objectives_json,
                        &language.clone().unwrap_or_default(),
                        &license.clone().unwrap_or_default(),
                        &estimated_duration.clone().unwrap_or_default(),
                    ],
                )
                .map_err(|e| e.to_string())?;

                imported += 1;
            }
        }
    }

    Ok(imported)
}

/// 浏览开源课件（支持分页和筛选）
#[command]
pub fn browse_open_materials(
    db_state: tauri::State<DbState>,
    query: MaterialQuery,
) -> Result<PaginatedMaterials, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let mut sql = "SELECT id, title, description, source, material_type, subject, level,
                   file_size, duration, download_url, preview_url, thumbnail,
                   detailed_description, learning_objectives, language, license,
                   estimated_duration, is_downloaded, local_path
                   FROM open_materials WHERE 1=1"
        .to_string();

    let mut params: Vec<String> = Vec::new();

    if let Some(source) = &query.source {
        if source != "all" {
            sql.push_str(" AND source = ?");
            params.push(source.clone());
        }
    }

    if let Some(subject) = &query.subject {
        sql.push_str(" AND subject = ?");
        params.push(subject.clone());
    }

    if let Some(level) = &query.level {
        sql.push_str(" AND level = ?");
        params.push(level.clone());
    }

    if let Some(material_type) = &query.material_type {
        sql.push_str(" AND material_type = ?");
        params.push(material_type.clone());
    }

    if let Some(keyword) = &query.keyword {
        sql.push_str(" AND (title LIKE ? OR description LIKE ?)");
        let like_keyword = format!("%{}%", keyword);
        params.push(like_keyword.clone());
        params.push(like_keyword);
    }

    // 获取总数
    let count_sql = format!("SELECT COUNT(*) FROM ({})", sql);
    let total: i64 = conn
        .query_row(
            &count_sql,
            rusqlite::params_from_iter(params.iter()),
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // 添加排序和分页
    let page = query.page.max(1);
    let page_size = query.page_size.min(100).max(1);
    let offset = (page - 1) * page_size;

    sql.push_str(" ORDER BY created_at DESC LIMIT ? OFFSET ?");
    params.push(page_size.to_string());
    params.push(offset.to_string());

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

    let materials = stmt
        .query_map(rusqlite::params_from_iter(params.iter()), |row| {
            let learning_objectives: String = row.get(13)?;
            Ok(OpenMaterial {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                source: row.get(3)?,
                material_type: row.get(4)?,
                subject: row.get(5)?,
                level: row.get(6)?,
                file_size: opt_string(row.get(7)?),
                duration: opt_string(row.get(8)?),
                download_url: opt_string(row.get(9)?),
                preview_url: opt_string(row.get(10)?),
                thumbnail: opt_string(row.get(11)?),
                detailed_description: opt_string(row.get(12)?),
                learning_objectives: if !learning_objectives.is_empty() {
                    serde_json::from_str(&learning_objectives).ok()
                } else {
                    None
                },
                language: opt_string(row.get(14)?),
                license: opt_string(row.get(15)?),
                estimated_duration: opt_string(row.get(16)?),
                is_downloaded: Some(row.get::<_, i32>(17)? == 1),
                local_path: opt_string(row.get(18)?),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|result| result.ok())
        .collect();

    let total_pages = if total > 0 {
        ((total as usize) + page_size - 1) / page_size
    } else {
        0
    };

    Ok(PaginatedMaterials {
        items: materials,
        total: total as usize,
        page,
        page_size,
        total_pages,
    })
}

/// 获取开源课件详情
#[command]
pub fn get_open_material_detail(
    db_state: tauri::State<DbState>,
    material_id: String,
) -> Result<OpenMaterial, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let mat = conn
        .query_row(
            "SELECT id, title, description, source, material_type, subject, level,
             file_size, duration, download_url, preview_url, thumbnail,
             detailed_description, learning_objectives, language, license,
             estimated_duration, is_downloaded, local_path
             FROM open_materials WHERE id = ?1",
            [&material_id],
            |row| {
                let learning_objectives: String = row.get(13)?;
                Ok(OpenMaterial {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    description: row.get(2)?,
                    source: row.get(3)?,
                    material_type: row.get(4)?,
                    subject: row.get(5)?,
                    level: row.get(6)?,
                    file_size: opt_string(row.get(7)?),
                    duration: opt_string(row.get(8)?),
                    download_url: opt_string(row.get(9)?),
                    preview_url: opt_string(row.get(10)?),
                    thumbnail: opt_string(row.get(11)?),
                    detailed_description: opt_string(row.get(12)?),
                    learning_objectives: if !learning_objectives.is_empty() {
                        serde_json::from_str(&learning_objectives).ok()
                    } else {
                        None
                    },
                    language: opt_string(row.get(14)?),
                    license: opt_string(row.get(15)?),
                    estimated_duration: opt_string(row.get(16)?),
                    is_downloaded: Some(row.get::<_, i32>(17)? == 1),
                    local_path: opt_string(row.get(18)?),
                })
            },
        )
        .map_err(|e| format!("Material not found: {}", e))?;

    Ok(mat)
}

/// 下载开源课件到本地（保存元数据 JSON 文件并标记 is_downloaded）
#[command]
pub fn download_open_material(
    db_state: tauri::State<DbState>,
    material_id: String,
    save_dir: String,
) -> Result<String, String> {
    let mat = get_open_material_detail(db_state.clone(), material_id.clone())?;

    // 创建本地存储路径
    let local_path = format!("{}/{}.json", save_dir, material_id);

    // 将元数据保存为 JSON 文件
    let json_data = serde_json::to_string_pretty(&mat).map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&save_dir).map_err(|e| e.to_string())?;
    std::fs::write(&local_path, json_data).map_err(|e| e.to_string())?;

    // 更新数据库记录
    let now = chrono::Utc::now().to_rfc3339();
    let conn = db_state.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE open_materials
         SET is_downloaded = 1, local_path = ?1, downloaded_at = ?2, updated_at = ?2
         WHERE id = ?3",
        rusqlite::params![&local_path, &now, &material_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(local_path)
}

/// 辅助函数：空字符串转 None
fn opt_string(s: String) -> Option<String> {
    if s.is_empty() {
        None
    } else {
        Some(s)
    }
}
