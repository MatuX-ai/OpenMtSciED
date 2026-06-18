/**
 * 场景: 知识图谱页面 (Neo4j → PostgreSQL 闭包表迁移回归)
 *
 * 核心验证：
 * 1. 页面基础元素（顶部说明、图表容器、筛选器、操作按钮）
 * 2. 拦截 /api/v1/learning/path 验证：
 *    - 请求方法 = GET
 *    - 携带 Authorization Bearer Token
 *    - 携带 limit query 参数
 * 3. console 验证：
 *    - 出现 "正在从 PostgreSQL 闭包表加载真实学习路径..."
 *    - 出现 "✅ 成功从 postgresql_closure 加载 N 条学习路径"（mock 数据响应时）
 *    - 不出现任何 Neo4j 相关日志（已迁移验证）
 * 4. 降级路径验证（mock 返回 500 时）：
 *    - console.warn 出现 "PostgreSQL 闭包表学习路径加载失败，已迁移至降级方案"
 *    - UI 不空白（保留 mock 数据）
 */

const { launchBrowser, newTrackedPage } = require('../helpers/browser');
const { waitFor, waitForText } = require('../helpers/dom');

const KNOWLEDGE_GRAPH_URL = '/knowledge-graph';
const LEARNING_PATH_API = '/api/v1/learning/path';

/** Mock 成功响应 */
const MOCK_SUCCESS_RESPONSE = {
  learning_path: [
    {
      id: 1,
      title: '工程设计流程',
      description: '从需求到原型的系统化方法',
      subject: 'engineering',
      grade: 'middle',
      difficulty: 'beginner',
      depth: 1,
      hasPrerequisites: true,
    },
    {
      id: 2,
      title: '科学探究方法',
      description: '假设-实验-结论三段式',
      subject: 'science',
      grade: 'middle',
      difficulty: 'intermediate',
      depth: 2,
      hasPrerequisites: true,
    },
  ],
  total: 2,
  filters: { subject: 'all', grade: 'all' },
  source: 'postgresql_closure',
};

/**
 * 通过注入 access_token 绕过 AuthGuard 路由保护
 */
async function injectAuth(page) {
  // 先访问根页面以建立 origin
  await page.goto(config.BASE_URL, { waitUntil: 'domcontentloaded', timeout: config.TIMEOUTS.navigation });
  await page.evaluate(() => {
    localStorage.setItem('access_token', 'e2e-test-token');
  });
}

/** 通用：断言无 Neo4j 相关日志 */
function assertNoNeo4jLogs(consoleLogs, reporter, testName) {
  const neo4jLogs = consoleLogs.filter((log) =>
    /neo4j/i.test(log.text || '') &&
    !/postgresql_closure|已迁移/i.test(log.text || '')
  );
  reporter.logTest(
    `${testName}: console 无 Neo4j 残留`,
    neo4jLogs.length === 0,
    neo4jLogs.length ? `残留: ${neo4jLogs.map((l) => l.text).slice(0, 3).join(' | ')}` : ''
  );
}

/** 通用：断言 console 包含 PostgreSQL 闭包表加载日志 */
function assertPostgresLogs(consoleLogs, reporter) {
  const startedLog = consoleLogs.find((l) => l.text && l.text.includes('正在从 PostgreSQL 闭包表加载真实学习路径'));
  reporter.logTest(
    'console 输出 PostgreSQL 闭包表加载日志',
    Boolean(startedLog),
    startedLog ? `"${startedLog.text}"` : '未找到启动日志'
  );
}

let config; // 由 run() 注入

async function run(_config, reporter) {
  config = _config;
  reporter.startScenario('knowledge-graph');

  // ========== 子场景 1：成功路径 ==========
  await runSuccessPath(config, reporter);

  // ========== 子场景 2：降级路径 ==========
  await runFallbackPath(config, reporter);

  reporter.endScenario();
}

async function runSuccessPath(config, reporter) {
  const browser = await launchBrowser(config);
  const { page, consoleLogs, apiCalls } = await newTrackedPage(browser);

  try {
    // 拦截 /api/v1/learning/path 返回 mock 数据
    await page.setRequestInterception(true);
    const interceptHandler = (req) => {
      if (req.url().includes(LEARNING_PATH_API)) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SUCCESS_RESPONSE),
        });
      } else {
        req.continue();
      }
    };
    page.on('request', interceptHandler);

    // 注入 token 绕过 AuthGuard
    await injectAuth(page);

    // 导航至知识图谱页面
    await page.goto(`${config.BASE_URL}${KNOWLEDGE_GRAPH_URL}`, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation,
    });

    // --- UI 元素验证 ---
    const hasHeader = await waitForText(page, 'STEM知识图谱与学习路径', config.TIMEOUTS.element);
    reporter.logTest('知识图谱页面加载（顶部说明可见）', hasHeader);

    const hasChartContainer = await waitFor(page, '.chart-container, echarts, canvas, svg', config.TIMEOUTS.element);
    reporter.logTest('ECharts 图表容器存在', hasChartContainer);

    const hasFilter = await waitFor(page, 'mat-select', config.TIMEOUTS.element);
    reporter.logTest('学段跨度筛选器存在', hasFilter);

    const hasExportBtn = await waitFor(page, 'button:has-text("导出学习路径")', config.TIMEOUTS.element);
    reporter.logTest('导出学习路径按钮存在', hasExportBtn);

    // --- API 调用验证 ---
    const learningPathCalls = apiCalls.filter((c) => c.url.includes(LEARNING_PATH_API));
    if (learningPathCalls.length === 0) {
      reporter.logTest('调用 /api/v1/learning/path', false, '未发现 API 请求');
    } else {
      const call = learningPathCalls[learningPathCalls.length - 1];
      reporter.logTest('调用 /api/v1/learning/path', true, `${call.method} ${call.url}`);

      const isGet = call.method === 'GET';
      reporter.logTest('请求方法为 GET', isGet, `实际: ${call.method}`);

      const hasAuth = call.headers && /Bearer\s+.+/i.test(call.headers.authorization || call.headers.Authorization || '');
      reporter.logTest('请求携带 Bearer Token', hasAuth, hasAuth ? '已注入' : '未携带');

      const hasLimit = /[?&]limit=/.test(call.url);
      reporter.logTest('请求携带 limit query 参数', hasLimit);
    }

    // --- console 日志验证 ---
    assertPostgresLogs(consoleLogs, reporter);

    const successLog = consoleLogs.find((l) =>
      l.text && l.text.includes('成功从 postgresql_closure 加载')
    );
    reporter.logTest(
      'console 输出 PostgreSQL 闭包表加载成功日志',
      Boolean(successLog),
      successLog ? `"${successLog.text}"` : '未找到成功日志（可能是 mock 数据未触发）'
    );

    assertNoNeo4jLogs(consoleLogs, reporter, '成功路径');
  } catch (err) {
    reporter.logTest('知识图谱成功路径', false, err.message);
  } finally {
    page.off('request', interceptHandler);
    await page.setRequestInterception(false);
    await page.close();
    await browser.close();
  }
}

async function runFallbackPath(config, reporter) {
  const browser = await launchBrowser(config);
  const { page, consoleLogs } = await newTrackedPage(browser);

  try {
    // 拦截 /api/v1/learning/path 返回 500
    await page.setRequestInterception(true);
    const interceptHandler = (req) => {
      if (req.url().includes(LEARNING_PATH_API)) {
        req.respond({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'server error', message: '闭包表查询失败' }),
        });
      } else {
        req.continue();
      }
    };
    page.on('request', interceptHandler);

    await injectAuth(page);
    await page.goto(`${config.BASE_URL}${KNOWLEDGE_GRAPH_URL}`, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation,
    });

    // 等待降级日志出现
    await new Promise((r) => setTimeout(r, 1500));

    const fallbackLog = consoleLogs.find((l) =>
      l.text && l.text.includes('PostgreSQL 闭包表学习路径加载失败')
    );
    reporter.logTest(
      '500 响应触发降级日志',
      Boolean(fallbackLog),
      fallbackLog ? `"${fallbackLog.text}"` : '未触发降级（前端可能未发起请求）'
    );

    // 验证 UI 不空白（mock 数据保留）
    const hasContent = await page.evaluate(() => {
      const tabs = document.querySelectorAll('mat-tab');
      return tabs.length > 0;
    });
    reporter.logTest('降级后 UI 不空白（保留 mock 数据）', hasContent);

    assertNoNeo4jLogs(consoleLogs, reporter, '降级路径');
  } catch (err) {
    reporter.logTest('知识图谱降级路径', false, err.message);
  } finally {
    page.off('request', interceptHandler);
    await page.setRequestInterception(false);
    await page.close();
    await browser.close();
  }
}

module.exports = { name: 'knowledge-graph', run };