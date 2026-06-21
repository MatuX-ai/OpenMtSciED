/**
 * 场景: 课题工作室基础流程
 */

const { launchBrowser, newTrackedPage } = require('../helpers/browser');
const { waitForButtonText, clickButtonText } = require('../helpers/dom');
const { injectAuth } = require('../helpers/auth');

async function run(config, reporter) {
  reporter.startScenario('topic-studio');
  const browser = await launchBrowser(config);
  const { page } = await newTrackedPage(browser);

  try {
    await injectAuth(page, config);
    await page.goto(`${config.BASE_URL}/topic-studio`, {
      waitUntil: 'networkidle0',
      timeout: config.TIMEOUTS.navigation,
    });

    const hasTitle = await page.waitForFunction(
      () => document.body.textContent.includes('课题工作室'),
      { timeout: config.TIMEOUTS.element }
    ).then(() => true).catch(() => false);
    reporter.logTest('课题工作室页面加载', hasTitle);
    if (!hasTitle) return;

    const hasNewBtn = await waitForButtonText(page, '新建课题', config.TIMEOUTS.element);
    reporter.logTest('新建课题按钮可见', hasNewBtn);
    if (!hasNewBtn) return;

    await clickButtonText(page, '新建课题');
    await new Promise((r) => setTimeout(r, 1000));

    const onWizard = await page.waitForFunction(
      () => document.body.textContent.includes('提出课题'),
      { timeout: 5000 }
    ).then(() => true).catch(() => false);
    reporter.logTest('进入六步向导', onWizard);
    if (!onWizard) return;

    await page.type('input[name="title"]', 'E2E测试课题');
    const hasSaveNext = await waitForButtonText(page, '保存并下一步', 5000);
    reporter.logTest('Step1 保存按钮可见', hasSaveNext);

    if (hasSaveNext) {
      await clickButtonText(page, '保存并下一步');
      await new Promise((r) => setTimeout(r, 1500));

      const step2 = await page.waitForFunction(
        () => document.body.textContent.includes('生成大纲'),
        { timeout: 5000 }
      ).then(() => true).catch(() => false);
      reporter.logTest('进入 Step2 AI 大纲', step2);
    }
  } catch (err) {
    reporter.logTest('课题工作室流程', false, err.message);
  } finally {
    await page.close();
    reporter.endScenario();
  }
}

module.exports = { name: 'topic-studio', run };
