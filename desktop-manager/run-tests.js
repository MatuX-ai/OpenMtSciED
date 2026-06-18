#!/usr/bin/env node
/**
 * Desktop Manager E2E 测试统一入口
 *
 * 使用方式：
 *   node run-tests.js
 *   E2E_ONLY=knowledge-graph node run-tests.js
 *   E2E_HEADLESS=true E2E_BASE_URL=http://localhost:4300 node run-tests.js
 *
 * 注意：需要先启动 Angular 开发服务器 (npm run start)
 */

const path = require('path');
const config = require('./tests/config');
const { Reporter } = require('./tests/helpers/reporter');
const { ensurePuppeteer, launchBrowser } = require('./tests/helpers/browser');

const ALL_SCENARIOS = [
  './tests/scenarios/app-load.spec.js',
  './tests/scenarios/setup-wizard.spec.js',
  './tests/scenarios/course-library.spec.js',
  './tests/scenarios/material-library.spec.js',
  './tests/scenarios/create-course.spec.js',
  './tests/scenarios/knowledge-graph.spec.js',
];

async function main() {
  console.log('\n🚀 Desktop Manager E2E 测试套件');
  console.log('=' .repeat(60));
  console.log(`  目标地址:  ${config.BASE_URL}`);
  console.log(`  无头模式:  ${config.HEADLESS}`);
  console.log(`  慢动作:    ${config.SLOWMO}ms`);
  if (config.ONLY) {
    console.log(`  仅运行:    ${config.ONLY.join(', ')}`);
  }
  console.log('=' .repeat(60));

  // 提前检测 puppeteer
  ensurePuppeteer();

  const reporter = new Reporter();

  // 检查目标服务是否可达
  try {
    const http = require('http');
    await new Promise((resolve, reject) => {
      const req = http.get(config.BASE_URL, { timeout: 3000 }, (res) => resolve(res));
      req.on('error', reject);
      req.on('timeout', () => req.destroy(new Error('连接超时')));
    });
    console.log('✓ 目标服务可达\n');
  } catch (err) {
    console.error(`\n❌ 无法连接目标服务: ${config.BASE_URL}`);
    console.error(`   ${err.message}`);
    console.error('   请先启动: cd desktop-manager && npm run start\n');
    process.exit(3);
  }

  // 加载并执行场景
  for (const specPath of ALL_SCENARIOS) {
    const fullPath = path.resolve(__dirname, specPath);
    const scenario = require(fullPath);

    if (config.ONLY && !config.ONLY.includes(scenario.name)) {
      continue;
    }

    try {
      await scenario.run(config, reporter);
    } catch (err) {
      reporter.logTest(`场景 "${scenario.name}" 抛出异常`, false, err.message);
      reporter.endScenario();
    }
  }

  const exitCode = reporter.summary();
  process.exit(exitCode);
}

main().catch((err) => {
  console.error('\n❌ 测试执行失败:', err);
  process.exit(1);
});