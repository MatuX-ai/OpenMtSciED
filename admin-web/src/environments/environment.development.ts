/**
 * 开发环境配置
 * 构建时通过 angular.json 的 fileReplacements 替换 environment.ts
 */
export const environment = {
  production: false,
  apiBase: '/api/v1',
  /** 开发环境演示功能开关（设为 true 可启用快速体验按钮等调试功能） */
  enableMockLogin: false,
};
