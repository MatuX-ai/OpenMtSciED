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

module.exports = { waitFor, waitForText, setLocalStorage, waitForAny };