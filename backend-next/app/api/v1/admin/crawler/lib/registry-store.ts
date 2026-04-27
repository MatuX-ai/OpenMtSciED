/**
 * 爬虫注册表（独立模块，避免循环依赖）
 */

// 爬虫注册表 - 使用 unknown 避免类型导入循环
export const crawlerRegistry = new Map<string, unknown>();
