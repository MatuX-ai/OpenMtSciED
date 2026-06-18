/**
 * Desktop Manager E2E 测试配置
 *
 * 可通过环境变量覆盖：
 *   E2E_BASE_URL    - 测试目标地址
 *   E2E_HEADLESS    - 是否无头模式 (true/false)
 *   E2E_SLOWMO      - 慢动作间隔毫秒数
 *   E2E_ONLY        - 仅运行指定场景（逗号分隔），如 "knowledge-graph,app-load"
 */

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:4200';

const HEADLESS = (() => {
  const v = process.env.E2E_HEADLESS;
  if (v === undefined) return false; // 默认有头模式，便于观察
  return v === 'true' || v === '1';
})();

const SLOWMO = parseInt(process.env.E2E_SLOWMO || '50', 10);

const TIMEOUTS = {
  navigation: 15000,    // 页面导航超时
  networkIdle: 10000,   // 等待 networkidle 超时
  element: 5000,        // 等待元素出现
  api: 8000,            // 等待 API 响应
};

const ONLY = process.env.E2E_ONLY
  ? process.env.E2E_ONLY.split(',').map((s) => s.trim()).filter(Boolean)
  : null;

module.exports = {
  BASE_URL,
  HEADLESS,
  SLOWMO,
  TIMEOUTS,
  ONLY,
};