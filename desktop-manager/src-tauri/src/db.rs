use rusqlite::{Connection, Result};
use std::path::Path;

pub fn init_db(db_path: &Path) -> Result<Connection> {
    let conn = Connection::open(db_path)?;

    // 创建课程表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
        [],
    )?;

    // 创建课件表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            course_id INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        )",
        [],
    )?;

    // 创建开源资源表（元数据）
    conn.execute(
        "CREATE TABLE IF NOT EXISTS open_resources (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            source TEXT NOT NULL,
            subject TEXT NOT NULL,
            level TEXT NOT NULL,
            difficulty INTEGER NOT NULL,
            has_hardware BOOLEAN NOT NULL DEFAULT 0,
            hardware_budget INTEGER,
            download_url TEXT,
            thumbnail TEXT,
            detailed_description TEXT,
            learning_objectives TEXT,
            materials_list TEXT,
            estimated_duration TEXT,
            is_downloaded BOOLEAN NOT NULL DEFAULT 0,
            local_content_path TEXT,
            downloaded_at TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
        [],
    )?;

    // 创建资源标签表（支持多标签）
    conn.execute(
        "CREATE TABLE IF NOT EXISTS resource_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resource_id TEXT NOT NULL,
            tag TEXT NOT NULL,
            FOREIGN KEY (resource_id) REFERENCES open_resources(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // 创建标签索引
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_resource_tags_resource_id ON resource_tags(resource_id)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_resource_tags_tag ON resource_tags(tag)",
        [],
    )?;

    Ok(conn)
}
