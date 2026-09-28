import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { performLogin } from './login';

type WorkerFixtures = {
  authContext: BrowserContext;
  authStorage: string;
};

type TestFixtures = {
  page: Page;
  _goHome: void;
};

const NAV_TIMEOUT = 20_000;

export const test = base.extend<TestFixtures, WorkerFixtures>({
  authContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],

  authStorage: [
    async ({ authContext }, use) => {
      const page = await authContext.newPage();
      await performLogin(page);
      await expect(page.locator('app-nav')).toBeVisible({ timeout: NAV_TIMEOUT });

      const storage = await page.evaluate(() => JSON.stringify(sessionStorage));
      await page.close();

      await use(storage);
    },
    { scope: 'worker', timeout: 90_000 },
  ],

  page: async ({ authContext, authStorage }, use) => {
    const page = await authContext.newPage();

    await page.addInitScript((json: string) => {
      Object.entries(JSON.parse(json) as Record<string, string>).forEach(
        ([key, value]) => window.sessionStorage.setItem(key, value),
      );
    }, authStorage);

    await use(page);
    await page.close();
  },

  _goHome: [
    async ({ page }, use) => {
      await page.goto('/');
      await expect(page.locator('app-nav')).toBeVisible({ timeout: NAV_TIMEOUT });
      await use();
    },
    { auto: true },
  ],
});

export { expect };