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
            category_id INTEGER,
            category TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )",
        [],
    )?;

    // 创建分类表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            color TEXT DEFAULT '#6366f1',
            icon TEXT DEFAULT 'folder',
            sort_order INTEGER DEFAULT 0,
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

    // 创建开源课件表（元数据，参考 open_resources 表结构并扩展课件特有字段）
    conn.execute(
        "CREATE TABLE IF NOT EXISTS open_materials (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            source TEXT NOT NULL,
            material_type TEXT NOT NULL,
            subject TEXT NOT NULL,
            level TEXT NOT NULL,
            file_size TEXT,
            duration TEXT,
            download_url TEXT,
            preview_url TEXT,
            thumbnail TEXT,
            detailed_description TEXT,
            learning_objectives TEXT,
            language TEXT DEFAULT 'en',
            license TEXT,
            estimated_duration TEXT,
            is_downloaded BOOLEAN NOT NULL DEFAULT 0,
            local_path TEXT,
            downloaded_at TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
        [],
    )?;

    // 开源课件索引
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_open_materials_source ON open_materials(source)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_open_materials_subject ON open_materials(subject)",
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

    // 创建用户项目表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS user_projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
        [],
    )?;

    // 创建项目资源关联表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS project_resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            resource_id TEXT NOT NULL,
            added_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (project_id) REFERENCES user_projects(id) ON DELETE CASCADE,
            FOREIGN KEY (resource_id) REFERENCES open_resources(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_project_resources_project_id ON project_resources(project_id)",
        [],
    )?;

    Ok(conn)
}
