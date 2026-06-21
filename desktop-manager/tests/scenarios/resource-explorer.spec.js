/**
 * 场景: 统一资源库 (/resource-explorer)
 *
 * 验证：
 * - 树面板标题与搜索框
 * - 新建教程按钮
 * - 旧路由重定向（/material-library、/tutorial-library）
 */

const { launchBrowser, newTrackedPage } = require('../helpers/browser');
const { waitFor, waitForText, waitForButtonText } = require('../helpers/dom');
const { injectAuth, refreshAuthToken } = require('../helpers/auth');

async function run(config, reporter) {
  reporter.startScenario('resource-explorer');
  const browser = await launchBrowser(config);
  const { page } = await newTrackedPage(browser);

  try {
    await injectAuth(page, config);
    await page.goto(`${config.BASE_URL}/resource-explorer`, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation,
    });

    const hasTreeHeader = await waitForText(page, '全部资源', config.TIMEOUTS.element);
    reporter.logTest('统一资源库树面板标题', hasTreeHeader);

    const hasSearch = await waitFor(page, 'input[placeholder*="搜索资源"]', config.TIMEOUTS.element);
    reporter.logTest('资源搜索框存在', hasSearch);

    const hasCreateButton = await waitForButtonText(page, '新建教程', config.TIMEOUTS.element);
    reporter.logTest('新建教程按钮存在', hasCreateButton);

    const hasTree = await waitFor(page, 'app-resource-tree-panel, app-tree-node', config.TIMEOUTS.element);
    reporter.logTest('资源树组件渲染', hasTree);

    // 旧路由重定向：/material-library?search=foo → /resource-explorer
    await refreshAuthToken(page);
    await page.goto(`${config.BASE_URL}/material-library?search=foo`, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation,
    });
    const materialRedirectOk = page.url().includes('/resource-explorer') && page.url().includes('search=foo');
    reporter.logTest('旧课件库路由重定向并保留 query', materialRedirectOk, page.url());

    // 旧路由重定向：/tutorial-library → /resource-explorer?type=tutorial
    await refreshAuthToken(page);
    await page.goto(`${config.BASE_URL}/tutorial-library`, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation,
    });
    const tutorialRedirectOk =
      page.url().includes('/resource-explorer') && page.url().includes('type=tutorial');
    reporter.logTest('旧教程库路由重定向', tutorialRedirectOk, page.url());

    await refreshAuthToken(page);
    await page.goto(`${config.BASE_URL}/resource-browser`, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation,
    });
    const browserRedirectOk = page.url().includes('/resource-explorer');
    reporter.logTest('旧资源浏览器路由重定向', browserRedirectOk, page.url());
  } catch (err) {
    reporter.logTest('统一资源库测试', false, err.message);
  } finally {
    await page.close();
    reporter.endScenario();
  }
}

module.exports = { name: 'resource-explorer', run };
