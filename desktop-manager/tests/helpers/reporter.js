/**
 * 测试报告器：彩色输出 + 失败聚合 + 退出码
 */

const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';

class Reporter {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      scenarios: [], // [{ name, tests: [{ name, passed, message, durationMs }], durationMs }]
      startedAt: Date.now(),
    };
    this.currentScenario = null;
    this.currentScenarioStart = 0;
  }

  startScenario(name) {
    this.currentScenario = { name, tests: [], durationMs: 0 };
    this.currentScenarioStart = Date.now();
    console.log(`\n${BOLD}${CYAN}📋 场景: ${name}${RESET}`);
  }

  endScenario() {
    if (this.currentScenario) {
      this.currentScenario.durationMs = Date.now() - this.currentScenarioStart;
      this.results.scenarios.push(this.currentScenario);
      this.currentScenario = null;
    }
  }

  logTest(name, passed, message = '') {
    const status = passed
      ? `${GREEN}✅ PASS${RESET}`
      : `${RED}❌ FAIL${RESET}`;
    console.log(`  ${status} ${name}`);
    if (message) console.log(`        ${message}`);

    if (passed) this.results.passed++;
    else this.results.failed++;

    if (this.currentScenario) {
      this.currentScenario.tests.push({
        name,
        passed,
        message,
        durationMs: 0,
      });
    }
  }

  summary() {
    const total = this.results.passed + this.results.failed;
    const passRate = total === 0 ? '0.0' : ((this.results.passed / total) * 100).toFixed(1);
    const duration = ((Date.now() - this.results.startedAt) / 1000).toFixed(1);

    console.log(`\n${BOLD}${'='.repeat(60)}${RESET}`);
    console.log(`${BOLD}📊 测试总结${RESET}`);
    console.log(`  场景数: ${this.results.scenarios.length}`);
    console.log(`  总用例: ${total}`);
    console.log(`  ${GREEN}通过: ${this.results.passed}${RESET}`);
    console.log(`  ${RED}失败: ${this.results.failed}${RESET}`);
    console.log(`  通过率: ${passRate}%`);
    console.log(`  耗时:   ${duration}s`);

    if (this.results.failed > 0) {
      console.log(`\n${YELLOW}失败明细:${RESET}`);
      this.results.scenarios.forEach((s) => {
        const failed = s.tests.filter((t) => !t.passed);
        if (failed.length === 0) return;
        console.log(`  ${CYAN}[${s.name}]${RESET}`);
        failed.forEach((t) => {
          console.log(`    ${RED}- ${t.name}${RESET}: ${t.message || '(无详情)'}`);
        });
      });
    }

    console.log(`${BOLD}${'='.repeat(60)}${RESET}\n`);
    return this.results.failed > 0 ? 1 : 0;
  }
}

module.exports = { Reporter };