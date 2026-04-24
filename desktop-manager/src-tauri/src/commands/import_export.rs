use serde::{Deserialize, Serialize};
use tauri::command;
use crate::commands::course::DbState;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportData {
    pub courses: Vec<CourseExport>,
    pub categories: Vec<CategoryExport>,
    pub export_time: String,
    pub version: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CourseExport {
    pub name: String,
    pub description: String,
    pub category: String,
    pub category_id: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CategoryExport {
    pub name: String,
    pub description: Option<String>,
    pub color: String,
    pub icon: String,
    pub sort_order: i64,
}

/// 导出教程库为JSON
#[command]
pub fn export_courses_to_json(db_state: tauri::State<DbState>, file_path: String) -> Result<String, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    // 导出分类
    let mut stmt = conn.prepare(
        "SELECT name, description, color, icon, sort_order FROM categories ORDER BY sort_order"
    ).map_err(|e| e.to_string())?;

    let categories: Vec<CategoryExport> = stmt.query_map([], |row| {
        Ok(CategoryExport {
            name: row.get(0)?,
            description: row.get(1)?,
            color: row.get(2)?,
            icon: row.get(3)?,
            sort_order: row.get(4)?,
        })
    }).map_err(|e| e.to_string())?
      .filter_map(|r| r.ok())
      .collect();

    // 导出课程
    let mut stmt = conn.prepare(
        "SELECT name, description, category_id, category FROM courses"
    ).map_err(|e| e.to_string())?;

    let courses: Vec<CourseExport> = stmt.query_map([], |row| {
        Ok(CourseExport {
            name: row.get(0)?,
            description: row.get(1)?,
            category_id: row.get(2)?,
            category: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?
      .filter_map(|r| r.ok())
      .collect();

    let cat_count = categories.len();
    let course_count = courses.len();

    let export_data = ExportData {
        courses,
        categories,
        export_time: chrono::Utc::now().to_rfc3339(),
        version: "1.0".to_string(),
    };

    let json = serde_json::to_string_pretty(&export_data).map_err(|e| e.to_string())?;
    
    fs::write(&file_path, &json).map_err(|e| format!("写入文件失败: {}", e))?;

    Ok(format!("成功导出 {} 个分类和 {} 个课程", cat_count, course_count))
}

/// 从JSON导入教程库
#[command]
pub fn import_courses_from_json(db_state: tauri::State<DbState>, file_path: String) -> Result<String, String> {
    let json_content = fs::read_to_string(&file_path)
        .map_err(|e| format!("读取文件失败: {}", e))?;

    let export_data: ExportData = serde_json::from_str(&json_content)
        .map_err(|e| format!("解析JSON失败: {}", e))?;

    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let mut imported_categories = 0;
    let mut imported_courses = 0;

    // 导入分类
    for cat in &export_data.categories {
        // 检查是否已存在
        let exists: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM categories WHERE name = ?1)",
            [&cat.name],
            |row| row.get(0)
        ).unwrap_or(false);

        if !exists {
            conn.execute(
                "INSERT INTO categories (name, description, color, icon, sort_order) VALUES (?1, ?2, ?3, ?4, ?5)",
                rusqlite::params![&cat.name, &cat.description, &cat.color, &cat.icon, cat.sort_order],
            ).map_err(|e| e.to_string())?;
            imported_categories += 1;
        }
    }

    // 导入课程
    for course in &export_data.courses {
        conn.execute(
            "INSERT INTO courses (name, description, category, category_id) VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![&course.name, &course.description, &course.category, &course.category_id],
        ).map_err(|e| e.to_string())?;
        imported_courses += 1;
    }

    Ok(format!("成功导入 {} 个分类和 {} 个课程", imported_categories, imported_courses))
}

/// 导出课件清单为CSV
#[command]
pub fn export_materials_to_csv(db_state: tauri::State<DbState>, file_path: String) -> Result<String, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT m.name, m.file_path, m.file_size, c.name as course_name, m.created_at 
         FROM materials m 
         LEFT JOIN courses c ON m.course_id = c.id 
         ORDER BY m.created_at DESC"
    ).map_err(|e| e.to_string())?;

    let mut csv_content = "课件名称,文件路径,文件大小(字节),所属课程,创建时间\n".to_string();

    let materials = stmt.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, i64>(2)?,
            row.get::<_, Option<String>>(3)?,
            row.get::<_, String>(4)?,
        ))
    }).map_err(|e| e.to_string())?
      .filter_map(|r| r.ok());

    let mut count = 0;
    for material in materials {
        let (name, path, size, course, created) = material;
        let course_name = course.unwrap_or_else(|| "未分类".to_string());
        
        // CSV转义
        let escaped_name = name.replace('"', "\"\"");
        let escaped_path = path.replace('"', "\"\"");
        let escaped_course = course_name.replace('"', "\"\"");
        
        csv_content.push_str(&format!(
            "\"{}\",\"{}\",{},\"{}\",\"{}\"\n",
            escaped_name, escaped_path, size, escaped_course, created
        ));
        count += 1;
    }

    fs::write(&file_path, &csv_content).map_err(|e| format!("写入文件失败: {}", e))?;

    Ok(format!("成功导出 {} 个课件的清单", count))
}

/// 备份数据库
#[command]
pub fn backup_database(db_state: tauri::State<DbState>, backup_dir: String) -> Result<String, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;
    
    // 获取数据库路径
    let db_path = conn.path().ok_or("无法获取数据库路径")?;
    
    // 生成备份文件名
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let backup_filename = format!("openmtscied_backup_{}.db", timestamp);
    let backup_path = PathBuf::from(&backup_dir).join(&backup_filename);
    
    // 确保备份目录存在
    let parent = backup_path.parent().ok_or("无效的备份路径")?;
    fs::create_dir_all(parent).map_err(|e| format!("创建备份目录失败: {}", e))?;
    
    // 复制数据库文件
    fs::copy(db_path, &backup_path).map_err(|e| format!("备份失败: {}", e))?;
    
    Ok(format!("数据库已备份到: {}", backup_path.display()))
}

/// 恢复数据库
#[command]
pub fn restore_database(db_state: tauri::State<DbState>, backup_file: String) -> Result<String, String> {
    let conn = db_state.lock().map_err(|e| e.to_string())?;
    let db_path = conn.path().ok_or("无法获取数据库路径")?;
    
    // 检查备份文件是否存在
    if !std::path::Path::new(&backup_file).exists() {
        return Err("备份文件不存在".to_string());
    }
    
    // 备份当前数据库
    let temp_backup = format!("{}.backup", db_path);
    fs::copy(&db_path, &temp_backup).map_err(|e| format!("备份当前数据库失败: {}", e))?;
    
    // 恢复数据库
    match fs::copy(&backup_file, &db_path) {
        Ok(_) => Ok("数据库恢复成功！请重启应用以生效。".to_string()),
        Err(e) => {
            // 如果恢复失败，尝试恢复原数据库
            let _ = fs::copy(&temp_backup, &db_path);
            Err(format!("恢复失败: {}", e))
        }
    }
}
