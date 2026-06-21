/**
 * 生产环境配置
 * 构建时替换 src/environments/environment.ts
 */
export const environment = {
  production: true,
  apiBase: '/api/v1',
  /** 生产环境始终禁用演示功能 */
  enableMockLogin: false,
};
