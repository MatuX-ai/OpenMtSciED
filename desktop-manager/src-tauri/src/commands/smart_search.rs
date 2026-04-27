use serde::{Deserialize, Serialize};
use crate::commands::course::DbState;

#[derive(Serialize, Deserialize, Debug)]
pub struct SmartSearchRequest {
    pub keyword: String,
    pub limit: usize,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SmartSearchResult {
    pub success: bool,
    pub source: String,
    pub data: Vec<serde_json::Value>,
}

/// 智能搜索命令
#[tauri::command]
pub async fn smart_search(
    db_state: tauri::State<'_, DbState>,
    keyword: String,
    limit: usize,
) -> Result<SmartSearchResult, String> {
    // 调用后端智能搜索 API
    let api_url = "http://localhost:3000"; // 从配置读取
    let client = reqwest::Client::new();
    
    let response = client
        .get(format!("{}/api/v1/resources/smart-search", api_url))
        .query(&[("keyword", &keyword), ("limit", &limit.to_string())])
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    let result: SmartSearchResult = response.json().await.map_err(|e| e.to_string())?;
    
    Ok(result)
}
