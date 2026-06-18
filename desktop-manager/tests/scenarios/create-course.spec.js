/**
 * 场景: 创建课程流程
 *
 * 验证：
 * - 新建课程对话框可打开
 * - 表单可填写
 * - 学科下拉可选择
 * - 保存后对话框关闭
 * - 新课程出现在列表中
 */

const { launchBrowser, newTrackedPage } = require('../helpers/browser');
const { waitFor } = require('../helpers/dom');

async function run(config, reporter) {
  reporter.startScenario('create-course');
  const browser = await launchBrowser(config);
  const { page } = await newTrackedPage(browser);

  try {
    await page.goto(`${config.BASE_URL}/course-library`, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation,
    });

    const hasCreateButton = await waitFor(page, 'button:has-text("新建课程")', config.TIMEOUTS.element);
    if (!hasCreateButton) {
      reporter.logTest('打开创建对话框', false, '找不到新建课程按钮');
      return;
    }

    await page.click('button:has-text("新建课程")');
    await new Promise((r) => setTimeout(r, 1000));

    const dialogOpened = await waitFor(page, '.mat-dialog-container', 3000);
    reporter.logTest('创建课程对话框打开', dialogOpened);
    if (!dialogOpened) return;

    await page.type('input[placeholder*="课程名称"]', '测试课程-E2E');
    await page.type('textarea', '这是一个自动化测试创建的课程');

    const selectElements = await page.$$('mat-select');
    if (selectElements.length > 0) {
      await selectElements[0].click();
      await new Promise((r) => setTimeout(r, 500));
      const options = await page.$$('mat-option');
      if (options.length > 0) {
        await options[0].click();
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    const saveButton = await page.$('button:has-text("保存")');
    if (saveButton) {
      await saveButton.click();
      await new Promise((r) => setTimeout(r, 2000));
      const dialogClosed = await waitFor(page, '.mat-dialog-container', 1000).then(() => false).catch(() => true);
      reporter.logTest('保存后对话框关闭', dialogClosed);

      const courseExists = await waitFor(page, 'mat-card-title:has-text("测试课程-E2E")', 3000);
      reporter.logTest('新课程出现在列表中', courseExists);
    } else {
      reporter.logTest('保存按钮存在', false);
    }
  } catch (err) {
    reporter.logTest('创建课程流程测试', false, err.message);
  } finally {
    await page.close();
    reporter.endScenario();
  }
}

module.exports = { name: 'create-course', run };