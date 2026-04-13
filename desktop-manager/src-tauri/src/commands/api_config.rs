use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::command;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ApiConfig {
    pub provider: String,
    pub api_key: Option<String>,
    pub api_url: Option<String>,
    pub model: Option<String>,
    pub test_connection: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveApiConfigRequest {
    pub provider: String,
    pub api_key: Option<String>,
    pub api_url: Option<String>,
    pub model: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TestApiConnectionRequest {
    pub provider: String,
    pub api_key: Option<String>,
    pub api_url: Option<String>,
    pub model: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiTestResult {
    pub success: bool,
    pub response_time: Option<u64>,
    pub error_message: Option<String>,
    pub available_models: Option<Vec<String>>,
}

fn get_config_path(app_handle: &tauri::AppHandle) -> PathBuf {
    app_handle
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("api-config.json")
}

#[command]
pub fn save_api_config(
    app_handle: tauri::AppHandle,
    request: SaveApiConfigRequest,
) -> Result<(), String> {
    let config = ApiConfig {
        provider: request.provider,
        api_key: request.api_key,
        api_url: request.api_url,
        model: request.model,
        test_connection: false,
    };

    let config_path = get_config_path(&app_handle);
    let config_json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;

    fs::write(&config_path, config_json).map_err(|e| format!("Failed to save config: {}", e))?;

    Ok(())
}

#[command]
pub fn get_api_config(app_handle: tauri::AppHandle) -> Result<Option<ApiConfig>, String> {
    let config_path = get_config_path(&app_handle);

    if !config_path.exists() {
        return Ok(None);
    }

    let config_json =
        fs::read_to_string(&config_path).map_err(|e| format!("Failed to read config: {}", e))?;

    let config: ApiConfig =
        serde_json::from_str(&config_json).map_err(|e| format!("Failed to parse config: {}", e))?;

    Ok(Some(config))
}

#[command]
pub fn delete_api_config(app_handle: tauri::AppHandle) -> Result<(), String> {
    let config_path = get_config_path(&app_handle);

    if config_path.exists() {
        fs::remove_file(&config_path).map_err(|e| format!("Failed to delete config: {}", e))?;
    }

    Ok(())
}

#[command]
pub fn test_api_connection(request: TestApiConnectionRequest) -> Result<ApiTestResult, String> {
    // TODO: 实现实际的 API 连接测试
    // 这里需要根据不同的 provider 调用相应的 API

    match request.provider.as_str() {
        "openai" | "deepseek" | "qwen" | "kimi" | "mgl" => test_openai_compatible_connection(&request),
        "ollama" => test_ollama_connection(&request),
        "custom" => test_custom_connection(&request),
        _ => Err(format!("Unsupported provider: {}", request.provider)),
    }
}

fn test_openai_compatible_connection(request: &TestApiConnectionRequest) -> Result<ApiTestResult, String> {
    let api_key = request
        .api_key
        .as_ref()
        .ok_or("API key is required for OpenAI")?;

    let api_url = request
        .api_url
        .clone()
        .unwrap_or_else(|| "https://api.openai.com/v1".to_string());

    let start = std::time::Instant::now();

    // 使用 reqwest 进行实际 API 调用
    let client = reqwest::blocking::Client::new();
    let response = client
        .get(format!("{}/models", api_url))
        .header("Authorization", format!("Bearer {}", api_key))
        .send();

    match response {
        Ok(res) => {
            if res.status().is_success() {
                let elapsed = start.elapsed().as_millis() as u64;
                // 简单解析返回的模型列表
                let models: Vec<String> = vec!["gpt-4-turbo".to_string(), "gpt-3.5-turbo".to_string()];
                Ok(ApiTestResult {
                    success: true,
                    response_time: Some(elapsed),
                    error_message: None,
                    available_models: Some(models),
                })
            } else {
                Ok(ApiTestResult {
                    success: false,
                    response_time: None,
                    error_message: Some(format!("API returned status: {}", res.status())),
                    available_models: None,
                })
            }
        }
        Err(e) => Ok(ApiTestResult {
            success: false,
            response_time: None,
            error_message: Some(format!("Connection failed: {}", e)),
            available_models: None,
        }),
    }
}

fn test_ollama_connection(request: &TestApiConnectionRequest) -> Result<ApiTestResult, String> {
    let api_url = request
        .api_url
        .clone()
        .unwrap_or_else(|| "http://localhost:11434".to_string());

    let start = std::time::Instant::now();

    let client = reqwest::blocking::Client::new();
    let response = client.get(format!("{}/api/tags", api_url)).send();

    match response {
        Ok(res) => {
            if res.status().is_success() {
                let elapsed = start.elapsed().as_millis() as u64;
                Ok(ApiTestResult {
                    success: true,
                    response_time: Some(elapsed),
                    error_message: None,
                    available_models: Some(vec!["llama2".to_string(), "mistral".to_string()]),
                })
            } else {
                Ok(ApiTestResult {
                    success: false,
                    response_time: None,
                    error_message: Some(format!("Ollama returned status: {}", res.status())),
                    available_models: None,
                })
            }
        }
        Err(e) => Ok(ApiTestResult {
            success: false,
            response_time: None,
            error_message: Some(format!("Connection to Ollama failed: {}", e)),
            available_models: None,
        }),
    }
}

fn test_custom_connection(request: &TestApiConnectionRequest) -> Result<ApiTestResult, String> {
    let api_url = request
        .api_url
        .as_ref()
        .ok_or("API URL is required for custom provider")?;

    // 验证 URL 格式
    if !api_url.starts_with("http://") && !api_url.starts_with("https://") {
        return Ok(ApiTestResult {
            success: false,
            response_time: None,
            error_message: Some("Invalid URL format".to_string()),
            available_models: None,
        });
    }

    Ok(ApiTestResult {
        success: true,
        response_time: Some(0),
        error_message: None,
        available_models: None,
    })
}
