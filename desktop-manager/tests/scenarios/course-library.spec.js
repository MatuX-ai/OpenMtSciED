/**
 * 场景: 教程库页面
 *
 * 验证：
 * - 教程库页面标题
 * - 新建课程按钮
 * - 课程列表容器
 * - 课程卡片或空状态显示
 */

const { launchBrowser, newTrackedPage } = require('../helpers/browser');
const { waitFor } = require('../helpers/dom');

async function run(config, reporter) {
  reporter.startScenario('course-library');
  const browser = await launchBrowser(config);
  const { page } = await newTrackedPage(browser);

  try {
    await page.goto(`${config.BASE_URL}/course-library`, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation,
    });

    const hasTitle = await waitFor(page, 'h1:has-text("教程库")', config.TIMEOUTS.element);
    reporter.logTest('教程库页面标题', hasTitle);

    const hasCreateButton = await waitFor(page, 'button:has-text("新建课程")', config.TIMEOUTS.element);
    reporter.logTest('新建课程按钮存在', hasCreateButton);

    const hasCourseGrid = await waitFor(page, '.course-grid, mat-card', config.TIMEOUTS.element);
    reporter.logTest('课程列表容器存在', hasCourseGrid);

    const hasCourses = await waitFor(page, 'mat-card', 2000);
    const hasEmptyState = await waitFor(page, '.empty-state', 2000);
    reporter.logTest('显示课程或空状态', hasCourses || hasEmptyState);
  } catch (err) {
    reporter.logTest('教程库测试', false, err.message);
  } finally {
    await page.close();
    reporter.endScenario();
  }
}

module.exports = { name: 'course-library', run };