/**
 * 基础环境配置（开发环境默认使用此文件）
 * 生产构建时通过 angular.json 的 fileReplacements 替换为 environment.production.ts
 */
export const environment = {
  production: false,
  apiBase: '/api/v1',
  /** 是否启用演示功能（如 mockLogin），生产环境始终关闭 */
  enableMockLogin: false,
};
