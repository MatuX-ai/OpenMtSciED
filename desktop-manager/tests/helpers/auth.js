/**
 * E2E 认证辅助：统一 request 拦截，避免多 handler 冲突
 */

const MOCK_USER = {
  id: 1,
  username: 'e2e-test-user',
  email: 'test@example.com',
  role: 'user',
  is_active: true,
  is_superuser: false,
  organization_id: null,
};

function isAuthMeRequest(url) {
  return url.includes('/api/v1/auth/me') || url.endsWith('/auth/me');
}

async function setupRequestInterception(page) {
  if (page.__e2eInterceptorSetup) return;
  page.__e2eInterceptorSetup = true;
  page.__e2eRequestHandlers = page.__e2eRequestHandlers || [];

  await page.setRequestInterception(true);
  page.on('request', async (req) => {
    try {
      for (const handler of page.__e2eRequestHandlers) {
        const handled = await handler(req);
        if (handled) return;
      }

      if (isAuthMeRequest(req.url())) {
        await req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_USER),
        });
        return;
      }

      await req.continue();
    } catch (err) {
      if (!String(err.message || err).includes('already handled')) {
        throw err;
      }
    }
  });
}

function addRequestHandler(page, handler) {
  page.__e2eRequestHandlers = page.__e2eRequestHandlers || [];
  page.__e2eRequestHandlers.push(handler);
}

async function injectAuth(page, config) {
  await setupRequestInterception(page);
  await page.goto(config.BASE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: config.TIMEOUTS.navigation,
  });
  await page.evaluate(() => {
    localStorage.setItem('access_token', 'e2e-test-token');
  });
}

async function refreshAuthToken(page) {
  await page.evaluate(() => {
    localStorage.setItem('access_token', 'e2e-test-token');
  });
}

module.exports = { injectAuth, refreshAuthToken, setupRequestInterception, addRequestHandler };
