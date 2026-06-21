/**
 * DOM 断言辅助工具
 */

async function waitFor(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * 等待并返回元素的 innerText 或属性，用于调试
 */
async function inspectElement(page, selector, timeout = 5000) {
  const el = await page.$(selector);
  if (!el) return { found: false, text: '', html: '' };
  const text = await el.innerText().catch(() => '');
  const html = await el.evaluate((e) => e.outerHTML.slice(0, 300)).catch(() => '');
  return { found: true, text, html };
}

async function waitForText(page, text, timeout = 5000) {
  try {
    await page.waitForFunction(
      (t) => document.body && document.body.innerText.includes(t),
      { timeout },
      text
    );
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * 设置 localStorage（例如注入 access_token 绕过 AuthGuard）
 */
async function setLocalStorage(page, key, value) {
  await page.evaluate(
    (k, v) => localStorage.setItem(k, v),
    key,
    value
  );
}

/**
 * 等待匹配任意一个选择器
 */
async function waitForAny(page, selectors, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    for (const sel of selectors) {
      const ok = await waitFor(page, sel, 200);
      if (ok) return sel;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

/**
 * 等待包含指定文本的 button（Puppeteer 兼容，不用 :has-text）
 */
async function waitForButtonText(page, text, timeout = 5000) {
  try {
    await page.waitForFunction(
      (label) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some((b) => (b.textContent || '').includes(label));
      },
      { timeout },
      text
    );
    return true;
  } catch {
    return false;
  }
}

async function clickButtonText(page, text) {
  const handle = await page.evaluateHandle((label) => {
    return Array.from(document.querySelectorAll('button')).find((b) =>
      (b.textContent || '').includes(label)
    );
  }, text);
  const element = handle.asElement();
  if (element) {
    await element.click();
    return true;
  }
  return false;
}

module.exports = { waitFor, waitForText, setLocalStorage, waitForAny, waitForButtonText, clickButtonText };