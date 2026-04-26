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
        baseUrl: 'https://openmtscied-api.vercel.app',  // 替换为实际后端地址
        timeout: 10000
    },
    // 开发环境（本地运行）
    development: {
        baseUrl: 'http://localhost:8000',
        timeout: 5000
    }
};

// 当前环境配置
const config = isProduction ? API_CONFIG.production : API_CONFIG.development;

// 导出配置
window.API_BASE_URL = config.baseUrl;
window.API_TIMEOUT = config.timeout;

// 调试信息（生产环境隐藏）
if (!isProduction) {
    console.log('🔧 API Configuration:', {
        environment: isProduction ? 'production' : 'development',
        baseUrl: config.baseUrl,
        timeout: config.timeout
    });
}
