use serde::{Deserialize, Serialize};
use tauri::command;
use crate::commands::course::DbState;
use std::fs;

/// 根据资源属性生成标签
fn generate_tags(subject: &str, level: &str, has_hardware: bool, difficulty: u8) -> Vec<String> {
    let mut tags = Vec::new();

    // 学科标签
    match subject {
        "biology" => tags.push("生物".to_string()),
        "physics" => tags.push("物理".to_string()),
        "chemistry" => tags.push("化学".to_string()),
        "engineering" => tags.push("工程".to_string()),
        "computer_science" => tags.push("计算机".to_string()),
        "math" => tags.push("数学".to_string()),
        _ => {}
    }

    // 学段标签
    match level {
        "elementary" => tags.push("小学".to_string()),
        "middle" => tags.push("初中".to_string()),
        "high" => tags.push("高中".to_string()),
        _ => {}
    }

    // 硬件相关标签
    if has_hardware {
        tags.push("需要硬件".to_string());
    } else {
        tags.push("无需硬件".to_string());
    }

    // 难度标签
    if difficulty <= 2 {
        tags.push("入门".to_string());
    } else if difficulty <= 3 {
        tags.push("中级".to_string());
    } else {
        tags.push("高级".to_string());
    }

    // STEM标签
    tags.push("STEM".to_string());

    tags
}

#[derive(Serialize, Deserialize, Clone)]
pub struct OpenResource {
    pub id: String,
    pub title: String,
    pub description: String,
    pub source: String,
    pub subject: String,
    pub level: String,
    pub difficulty: u8,
    pub has_hardware: bool,
    pub hardware_budget: Option<u32>,
    pub download_url: Option<String>,
    pub thumbnail: Option<String>,
    pub detailed_description: Option<String>,
    pub learning_objectives: Option<Vec<String>>,
    pub materials_list: Option<Vec<String>>,
    pub estimated_duration: Option<String>,
    pub is_downloaded: Option<bool>,
    pub local_content_path: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ResourceQuery {
    pub source: Option<String>,
    pub subject: Option<String>,
    pub level: Option<String>,
    pub keyword: Option<String>,
    pub page: usize,
    pub page_size: usize,
}

#[derive(Serialize, Deserialize)]
pub struct PaginatedResources {
    pub items: Vec<OpenResource>,
    pub total: usize,
    pub page: usize,
    pub page_size: usize,
    pub total_pages: usize,
}

/// 从 JSON 文件导入资源到数据库（首次启动时调用）
#[command]
pub fn import_resources_from_json(db_state: tauri::State<DbState>) -> Result<usize, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    // 读取 JSON 文件
    let data_dir = std::env::current_dir()
        .map_err(|e| e.to_string())?
        .join("data");

    let json_path = data_dir.join("open_resources.json");
    let json_content = fs::read_to_string(&json_path)
        .map_err(|e| format!("Failed to read resources file: {}", e))?;

    let all_resources: serde_json::Value = serde_json::from_str(&json_content)
        .map_err(|e| format!("Failed to parse resources: {}", e))?;

    let mut imported_count = 0;

    // 遍历所有来源
    for src in &["openscied", "gewustan", "stemcloud"] {
        if let Some(resources) = all_resources["sources"][src].as_array() {
            for res_value in resources {
                let id = res_value["id"].as_str().unwrap_or("").to_string();

                // 检查是否已存在
                let exists: bool = conn.query_row(
                    "SELECT COUNT(*) FROM open_resources WHERE id = ?1",
                    [&id],
                    |row| row.get(0)
                ).unwrap_or(0) > 0;

                if exists {
                    continue;
                }

                // 插入资源
                let title = res_value["title"].as_str().unwrap_or("").to_string();
                let description = res_value["description"].as_str().unwrap_or("").to_string();
                let source = res_value["source"].as_str().unwrap_or(src).to_string();
                let subject = res_value["subject"].as_str().unwrap_or("").to_string();
                let level = res_value["level"].as_str().unwrap_or("").to_string();
                let difficulty = res_value["difficulty"].as_u64().unwrap_or(3) as u8;
                let has_hardware = res_value["has_hardware"].as_bool().unwrap_or(false);
                let hardware_budget = res_value["hardware_budget"].as_u64().map(|v| v as i32);
                let download_url = res_value["download_url"].as_str().map(|s| s.to_string());
                let thumbnail = res_value["thumbnail"].as_str().map(|s| s.to_string());
                let detailed_description = res_value["detailed_description"].as_str().map(|s| s.to_string());
                let estimated_duration = res_value["estimated_duration"].as_str().map(|s| s.to_string());

                // 序列化数组字段
                let learning_objectives_json = res_value["learning_objectives"]
                    .as_array()
                    .map(|arr| serde_json::to_string(arr).unwrap_or_default())
                    .unwrap_or_default();

                let materials_list_json = res_value["materials_list"]
                    .as_array()
                    .map(|arr| serde_json::to_string(arr).unwrap_or_default())
                    .unwrap_or_default();

                conn.execute(
                    "INSERT INTO open_resources (
                        id, title, description, source, subject, level, difficulty,
                        has_hardware, hardware_budget, download_url, thumbnail,
                        detailed_description, learning_objectives, materials_list,
                        estimated_duration, is_downloaded
                    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, 0)",
                    [
                        &id,
                        &title,
                        &description,
                        &source,
                        &subject,
                        &level,
                        &difficulty.to_string(),
                        &if has_hardware { "1".to_string() } else { "0".to_string() },
                        &hardware_budget.map_or("".to_string(), |v| v.to_string()),
                        &download_url.unwrap_or_default(),
                        &thumbnail.unwrap_or_default(),
                        &detailed_description.unwrap_or_default(),
                        &learning_objectives_json,
                        &materials_list_json,
                        &estimated_duration.unwrap_or_default(),
                    ],
                ).map_err(|e| e.to_string())?;

                // 自动生成并插入标签
                let tags = generate_tags(&subject, &level, has_hardware, difficulty);
                for tag in &tags {
                    conn.execute(
                        "INSERT INTO resource_tags (resource_id, tag) VALUES (?1, ?2)",
                        [&id, tag],
                    ).map_err(|e| e.to_string())?;
                }

                imported_count += 1;
            }
        }
    }

    Ok(imported_count)
}

/// 浏览开源资源（支持分页和筛选，从数据库查询）
#[command]
pub fn browse_open_resources(
    db_state: tauri::State<DbState>,
    query: ResourceQuery,
) -> Result<PaginatedResources, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    // 构建 SQL 查询
    let mut sql = "SELECT id, title, description, source, subject, level, difficulty,
                    has_hardware, hardware_budget, download_url, thumbnail,
                    detailed_description, learning_objectives, materials_list,
                    estimated_duration, is_downloaded, local_content_path
                    FROM open_resources WHERE 1=1".to_string();

    let mut params: Vec<String> = Vec::new();

    // 添加筛选条件
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

    if let Some(keyword) = &query.keyword {
        sql.push_str(" AND (title LIKE ? OR description LIKE ?)");
        let like_keyword = format!("%{}%", keyword);
        params.push(like_keyword.clone());
        params.push(like_keyword);
    }

    // 获取总数
    let count_sql = format!("SELECT COUNT(*) FROM ({})", sql);
    let total: i64 = conn.query_row(
        &count_sql,
        rusqlite::params_from_iter(params.iter()),
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;

    // 添加排序和分页
    sql.push_str(" ORDER BY created_at DESC LIMIT ? OFFSET ?");

    let page = query.page.max(1);
    let page_size = query.page_size.min(100).max(1);
    let offset = (page - 1) * page_size;

    params.push(page_size.to_string());
    params.push(offset.to_string());

    // 执行查询
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

    let resources = stmt
        .query_map(rusqlite::params_from_iter(params.iter()), |row| {
            let learning_objectives: String = row.get(12)?;
            let materials_list: String = row.get(13)?;

            Ok(OpenResource {
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

    let total_pages = if total > 0 { ((total as usize) + page_size - 1) / page_size } else { 0 };

    Ok(PaginatedResources {
        items: resources,
        total: total as usize,
        page,
        page_size,
        total_pages,
    })
}

/// 获取资源详情
#[command]
pub fn get_resource_detail(resource_id: String) -> Result<OpenResource, String> {
    let data_dir = std::env::current_dir()
        .map_err(|e| e.to_string())?
        .join("data");

    let json_path = data_dir.join("open_resources.json");
    let json_content = fs::read_to_string(&json_path)
        .map_err(|e| e.to_string())?;

    let all_resources: serde_json::Value = serde_json::from_str(&json_content)
        .map_err(|e| e.to_string())?;

    for src in &["openscied", "gewustan", "stemcloud"] {
        if let Some(resources) = all_resources["sources"][src].as_array() {
            for res in resources {
                if res["id"] == resource_id {
                    return serde_json::from_value(res.clone())
                        .map_err(|e| e.to_string());
                }
            }
        }
    }

    Err(format!("Resource not found: {}", resource_id))
}

/// 下载开源资源到本地
#[command]
pub fn download_open_resource(
    db_state: tauri::State<DbState>,
    resource_id: String,
    save_dir: String,
) -> Result<String, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    // 从JSON文件查找资源
    let data_dir = std::env::current_dir()
        .map_err(|e| e.to_string())?
        .join("data");

    let json_path = data_dir.join("open_resources.json");
    let json_content = fs::read_to_string(&json_path)
        .map_err(|e| e.to_string())?;

    let all_resources: serde_json::Value = serde_json::from_str(&json_content)
        .map_err(|e| e.to_string())?;

    let mut resource_found = None;
    for src in &["openscied", "gewustan", "stemcloud"] {
        if let Some(resources) = all_resources["sources"][src].as_array() {
            for res in resources {
                if res["id"] == resource_id {
                    resource_found = Some(res.clone());
                    break;
                }
            }
        }
        if resource_found.is_some() {
            break;
        }
    }

    let resource_value = resource_found.ok_or_else(|| format!("Resource not found: {}", resource_id))?;
    let resource: OpenResource = serde_json::from_value(resource_value)
        .map_err(|e| e.to_string())?;

    // 创建本地存储路径
    let local_path = format!("{}/{}.json", save_dir, resource_id);

    // 将资源数据保存为 JSON 文件
    let json_data = serde_json::to_string_pretty(&resource).map_err(|e| e.to_string())?;
    std::fs::write(&local_path, json_data).map_err(|e| e.to_string())?;

    // 更新数据库记录
    let now = chrono::Utc::now().to_rfc3339();
    let learning_objectives_json = resource
        .learning_objectives
        .as_ref()
        .map(|obj| serde_json::to_string(obj).unwrap_or_default())
        .unwrap_or_default();
    let materials_list_json = resource
        .materials_list
        .as_ref()
        .map(|list| serde_json::to_string(list).unwrap_or_default())
        .unwrap_or_default();

    conn.execute(
        "INSERT OR REPLACE INTO open_resources (
            id, title, description, source, subject, level, difficulty,
            has_hardware, hardware_budget, download_url, thumbnail,
            detailed_description, learning_objectives, materials_list,
            estimated_duration, is_downloaded, local_content_path, downloaded_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, 1, ?16, ?17)",
        [
            &resource.id,
            &resource.title,
            &resource.description,
            &resource.source,
            &resource.subject,
            &resource.level,
            &resource.difficulty.to_string(),
            &if resource.has_hardware { "1".to_string() } else { "0".to_string() },
            &resource.hardware_budget.map_or("".to_string(), |b| b.to_string()),
            &resource.download_url.unwrap_or_default(),
            &resource.thumbnail.unwrap_or_default(),
            &resource.detailed_description.unwrap_or_default(),
            &learning_objectives_json,
            &materials_list_json,
            &resource.estimated_duration.unwrap_or_default(),
            &local_path,
            &now,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(local_path)
}

/// 获取已下载的本地资源列表
#[command]
pub fn get_local_resources(db_state: tauri::State<DbState>) -> Result<Vec<OpenResource>, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, source, subject, level, difficulty,
             has_hardware, hardware_budget, download_url, thumbnail,
             detailed_description, learning_objectives, materials_list,
             estimated_duration, is_downloaded, local_path
             FROM open_resources WHERE is_downloaded = 1 ORDER BY downloaded_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let resources = stmt
        .query_map([], |row| {
            let learning_objectives: String = row.get(12)?;
            let materials_list: String = row.get(13)?;

            Ok(OpenResource {
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

/// 获取资源的标签列表
#[command]
pub fn get_resource_tags(
    db_state: tauri::State<DbState>,
    resource_id: String,
) -> Result<Vec<String>, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT tag FROM resource_tags WHERE resource_id = ?1 ORDER BY tag")
        .map_err(|e| e.to_string())?;

    let tags = stmt
        .query_map([&resource_id], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .filter_map(|result| result.ok())
        .collect();

    Ok(tags)
}

/// 根据标签筛选资源
#[command]
pub fn browse_resources_by_tag(
    db_state: tauri::State<DbState>,
    tag: String,
    page: usize,
    page_size: usize,
) -> Result<PaginatedResources, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    // 先获取具有该标签的资源ID列表
    let mut stmt = conn
        .prepare(
            "SELECT r.id, r.title, r.description, r.source, r.subject, r.level, r.difficulty,
             r.has_hardware, r.hardware_budget, r.download_url, r.thumbnail,
             r.detailed_description, r.learning_objectives, r.materials_list,
             r.estimated_duration, r.is_downloaded, r.local_content_path
             FROM open_resources r
             INNER JOIN resource_tags t ON r.id = t.resource_id
             WHERE t.tag = ?1
             ORDER BY r.created_at DESC
             LIMIT ?2 OFFSET ?3",
        )
        .map_err(|e| e.to_string())?;

    let page = page.max(1);
    let page_size = page_size.min(100).max(1);
    let offset = (page - 1) * page_size;

    let resources = stmt
        .query_map(rusqlite::params![&tag, &(page_size as i32), &(offset as i32)], |row| {
            let learning_objectives: String = row.get(12)?;
            let materials_list: String = row.get(13)?;

            Ok(OpenResource {
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

    // 获取总数
    let total: i64 = conn.query_row(
        "SELECT COUNT(DISTINCT r.id) FROM open_resources r INNER JOIN resource_tags t ON r.id = t.resource_id WHERE t.tag = ?1",
        [&tag],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;

    let total_pages = if total > 0 { ((total as usize) + page_size - 1) / page_size } else { 0 };

    Ok(PaginatedResources {
        items: resources,
        total: total as usize,
        page,
        page_size,
        total_pages,
    })
}


