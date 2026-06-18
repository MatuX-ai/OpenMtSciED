/**
 * 场景: 课件库页面
 *
 * 验证：
 * - 课件库页面标题
 * - 上传课件按钮
 * - 课程筛选器
 * - 课件列表容器
 */

const { launchBrowser, newTrackedPage } = require('../helpers/browser');
const { waitFor } = require('../helpers/dom');

async function run(config, reporter) {
  reporter.startScenario('material-library');
  const browser = await launchBrowser(config);
  const { page } = await newTrackedPage(browser);

  try {
    await page.goto(`${config.BASE_URL}/material-library`, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation,
    });

    const hasTitle = await waitFor(page, 'h1:has-text("课件库")', config.TIMEOUTS.element);
    reporter.logTest('课件库页面标题', hasTitle);

    const hasUploadButton = await waitFor(page, 'button:has-text("上传课件")', config.TIMEOUTS.element);
    reporter.logTest('上传课件按钮存在', hasUploadButton);

    const hasCourseFilter = await waitFor(page, 'mat-form-field', config.TIMEOUTS.element);
    reporter.logTest('课程筛选器存在', hasCourseFilter);

    const hasMaterialGrid = await waitFor(page, '.material-grid, mat-card', config.TIMEOUTS.element);
    reporter.logTest('课件列表容器存在', hasMaterialGrid);
  } catch (err) {
    reporter.logTest('课件库测试', false, err.message);
  } finally {
    await page.close();
    reporter.endScenario();
  }
}

module.exports = { name: 'material-library', run };