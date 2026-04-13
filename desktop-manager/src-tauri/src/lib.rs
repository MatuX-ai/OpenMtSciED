mod commands;
mod db;

use std::path::PathBuf;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::new().build())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    // .plugin(tauri_plugin_shell::init())  // TODO: 添加 tauri-plugin-shell 依赖
    .setup(|app| {
      // 初始化数据库
      let db_path = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("openmtscied.db");

      // 创建数据目录
      let data_dir = db_path.parent().unwrap();
      std::fs::create_dir_all(data_dir).ok();

      // 创建课件存储目录
      let materials_dir = data_dir.join("materials");
      std::fs::create_dir_all(&materials_dir).ok();
      // 创建备份目录
      let backup_dir = data_dir.join("backups");
      std::fs::create_dir_all(&backup_dir).ok();

      // 初始化数据库连接
      let conn = db::init_db(&db_path).expect("Failed to initialize database");
      app.manage(commands::course::DbState::new(std::sync::Mutex::new(conn)));

      // 首次启动时从 JSON 导入资源数据
      if let Some(db_state) = app.try_state::<commands::course::DbState>() {
        match commands::resource::import_resources_from_json(db_state) {
          Ok(count) => println!("✓ 成功导入 {} 个开源资源", count),
          Err(e) => eprintln!("⚠ 导入资源失败: {}", e),
        }
      }

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::course::get_courses,
      commands::course::create_course,
      commands::course::update_course,
      commands::course::delete_course,
      commands::material::get_materials,
      commands::material::upload_material,
      commands::material::delete_material,
      commands::resource::import_resources_from_json,
      commands::resource::browse_open_resources,
      commands::resource::get_resource_detail,
      commands::resource::download_open_resource,
      commands::resource::get_local_resources,
      commands::resource::get_resource_tags,
      commands::resource::browse_resources_by_tag,
      commands::storage::get_storage_info,
      commands::storage::get_folder_size,
      commands::api_config::save_api_config,
      commands::api_config::get_api_config,
      commands::api_config::delete_api_config,
      commands::api_config::test_api_connection,
      commands::utils::open_url,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
