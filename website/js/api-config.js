/**
 * OpenMTSciEd API 配置
 * 根据环境自动切换 API 地址
 */

// 环境检测
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

// API 基础地址配置
const API_CONFIG = {
    // 生产环境（Vercel 部署）
    production: {
        baseUrl: '',  // 同一域名，使用相对路径
        timeout: 10000
    },
    // 开发环境（本地运行）
    development: {
        baseUrl: 'http://localhost:3000',
        timeout: 5000
    }
};

// 当前环境配置
const config = isProduction ? API_CONFIG.production : API_CONFIG.development;

// 导出配置
window.API_BASE_URL = config.baseUrl;            // 裸域名（http://localhost:3000 或 ''）
window.API_PREFIX = config.baseUrl + '/api/v1';   // 完整 API 前缀（含 /api/v1）
window.API_TIMEOUT = config.timeout;

/**
 * 拼接 API URL 的辅助函数
 * @param {string} path - 接口路径（必须以 / 开头）
 * @returns {string} 完整 URL
 */
window.apiUrl = function(path) {
    const prefix = window.API_PREFIX || (window.API_BASE_URL + '/api/v1');
    const p = path.startsWith('/') ? path : '/' + path;
    return prefix + p;
};

// 调试信息（生产环境隐藏）
if (!isProduction) {
    console.log('🔧 API Configuration:', {
        environment: isProduction ? 'production' : 'development',
        baseUrl: config.baseUrl,
        timeout: config.timeout
    });
}
