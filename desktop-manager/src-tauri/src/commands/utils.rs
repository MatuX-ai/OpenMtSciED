use tauri::command;

#[derive(Debug, serde::Deserialize)]
pub struct OpenUrlRequest {
    pub url: String,
}

#[command]
pub async fn open_url(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| format!("Failed to open URL: {}", e))
}
