/**
 * 浏览器启动辅助
 * - 检测 puppeteer 是否可用，给出友好错误
 * - 统一启动参数（沙盒、慢动作）
 */

let puppeteer = null;
let puppeteerMissing = false;

try {
  puppeteer = require('puppeteer');
} catch (err) {
  puppeteerMissing = true;
}

function ensurePuppeteer() {
  if (puppeteerMissing || !puppeteer) {
    console.error('\n❌ 未找到 puppeteer 依赖');
    console.error('   请运行:  cd desktop-manager && npm install puppeteer --save-dev\n');
    process.exit(2);
  }
  return puppeteer;
}

async function launchBrowser(config) {
  const p = ensurePuppeteer();
  return p.launch({
    headless: config.HEADLESS,
    slowMo: config.SLOWMO,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

/**
 * 创建带控制台/网络监听的新页面
 * @returns {{ page, consoleLogs, apiCalls }}
 */
async function newTrackedPage(browser) {
  const page = await browser.newPage();
  const consoleLogs = [];
  const apiCalls = [];

  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    consoleLogs.push({ type: 'pageerror', text: err.message });
  });
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/')) {
      apiCalls.push({
        method: req.method(),
        url,
        headers: req.headers(),
        postData: req.postData(),
      });
    }
  });

  return { page, consoleLogs, apiCalls };
}

module.exports = {
  ensurePuppeteer,
  launchBrowser,
  newTrackedPage,
};