/**
 * 场景: 初始化向导
 *
 * 验证多步向导的基础 UI 与表单验证
 */

const { launchBrowser, newTrackedPage } = require('../helpers/browser');
const { waitFor, waitForText } = require('../helpers/dom');

async function run(config, reporter) {
  reporter.startScenario('setup-wizard');
  const browser = await launchBrowser(config);
  const { page } = await newTrackedPage(browser);

  try {
    await page.goto(`${config.BASE_URL}/setup-wizard`, {
      waitUntil: 'domcontentloaded',
      timeout: config.TIMEOUTS.navigation,
    });

    const hasStart = await waitForText(page, '开始', config.TIMEOUTS.element);
    reporter.logTest('向导起始步骤可见', hasStart);

    const startBtn = await page.$('button');
    if (startBtn) {
      await startBtn.click();
      await new Promise((r) => setTimeout(r, 500));
    }

    const hasTeacherField = await waitFor(page, 'input[name="teacherName"], mat-form-field', config.TIMEOUTS.element);
    reporter.logTest('教师姓名字段存在', hasTeacherField);

    const hasSubjectSelect = await waitFor(page, 'mat-select', config.TIMEOUTS.element);
    reporter.logTest('学科选择器存在', hasSubjectSelect);

    const hasNextButton = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).some((b) => b.textContent.includes('下一步'))
    );
    reporter.logTest('下一步按钮存在', hasNextButton);

    if (hasNextButton) {
      const nextDisabledWhenEmpty = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('下一步'));
        return btn ? btn.disabled : false;
      });
      reporter.logTest('教师姓名为空时下一步禁用', nextDisabledWhenEmpty);
    }
  } catch (err) {
    reporter.logTest('初始化向导测试', false, err.message);
  } finally {
    await page.close();
    reporter.endScenario();
  }
}

module.exports = { name: 'setup-wizard', run };
