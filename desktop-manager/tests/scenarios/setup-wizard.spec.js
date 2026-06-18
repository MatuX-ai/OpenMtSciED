/**
 * 场景: 初始化向导
 *
 * 验证：
 * - 教师姓名字段存在
 * - 学校名称字段存在
 * - 学科选择器存在
 * - 提交按钮存在
 * - 空表单触发验证
 */

const { launchBrowser, newTrackedPage } = require('../helpers/browser');
const { waitFor } = require('../helpers/dom');

async function run(config, reporter) {
  reporter.startScenario('setup-wizard');
  const browser = await launchBrowser(config);
  const { page } = await newTrackedPage(browser);

  try {
    await page.goto(`${config.BASE_URL}/setup-wizard`, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation,
    });

    const hasTeacherName = await waitFor(page, 'input[placeholder*="教师姓名"]', config.TIMEOUTS.element);
    reporter.logTest('教师姓名字段存在', hasTeacherName);

    const hasSchoolName = await waitFor(page, 'input[placeholder*="学校名称"]', config.TIMEOUTS.element);
    reporter.logTest('学校名称字段存在', hasSchoolName);

    const hasSubjectSelect = await waitFor(page, 'mat-select', config.TIMEOUTS.element);
    reporter.logTest('学科选择器存在', hasSubjectSelect);

    const hasSubmitButton = await waitFor(page, 'button:has-text("完成设置")', config.TIMEOUTS.element);
    reporter.logTest('提交按钮存在', hasSubmitButton);

    if (hasSubmitButton) {
      await page.click('button:has-text("完成设置")');
      await new Promise((r) => setTimeout(r, 1000));
      const hasValidationErrors = await page.evaluate(() => document.querySelector('.ng-invalid') !== null);
      reporter.logTest('空表单触发验证', hasValidationErrors);
    }
  } catch (err) {
    reporter.logTest('初始化向导测试', false, err.message);
  } finally {
    await page.close();
    reporter.endScenario();
  }
}

module.exports = { name: 'setup-wizard', run };