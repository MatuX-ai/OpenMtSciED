/**
 * 场景: 应用加载
 *
 * 验证：
 * - 应用根页面可访问
 * - 自动重定向到登录或仪表盘（未登录） / 仪表盘（已登录）
 */

const { newTrackedPage } = require('../helpers/browser');

async function run(config, reporter) {
  reporter.startScenario('app-load');
  const { page } = await newTrackedPage(await (require('../helpers/browser').launchBrowser(config)));

  try {
    await page.goto(config.BASE_URL, { waitUntil: 'domcontentloaded', timeout: config.TIMEOUTS.navigation });

    const title = await page.title();
    reporter.logTest('应用页面加载', true, `页面标题: ${title}`);

    const currentUrl = page.url();
    const isExpectedLanding =
      currentUrl.includes('setup-wizard') ||
      currentUrl.includes('login') ||
      currentUrl.includes('dashboard') ||
      currentUrl === config.BASE_URL + '/' ||
      currentUrl === config.BASE_URL;
    reporter.logTest('路由重定向至合法入口', isExpectedLanding, `当前URL: ${currentUrl}`);

    await page.goto(`${config.BASE_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: config.TIMEOUTS.navigation,
    });
    const loginHasNoSidebar = await page.evaluate(() => !document.querySelector('app-sidebar'));
    reporter.logTest('登录页无侧边栏', loginHasNoSidebar);
  } catch (err) {
    reporter.logTest('应用页面加载', false, err.message);
  } finally {
    await page.close();
    reporter.endScenario();
  }
}

module.exports = { name: 'app-load', run };