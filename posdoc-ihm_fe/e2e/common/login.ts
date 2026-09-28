import { expect, type Page } from '@playwright/test';

const USERNAME = 'AC750G0090';
const PASSWORD = 'posdoc';

const hideLoadingOverlay = (page: Page) =>
  page.evaluate(() => {
    document.getElementById('div-loading')?.style.setProperty('display', 'none');
  });

const waitIdle = (page: Page) =>
  page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});

export async function performLogin(page: Page) {
  await page.goto('/');
  await page.waitForTimeout(2000);
  await hideLoadingOverlay(page);

  const connexion = page.getByText('Connexion').first();
  if (!(await connexion.count())) return;

  await connexion.click({ force: true });
  await waitIdle(page);
  await page.waitForTimeout(2000);
  await hideLoadingOverlay(page);

  const username = page.locator('#username');
  await username.waitFor({ state: 'visible', timeout: 30_000 });
  await username.fill(USERNAME);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('#password').press('Enter');

  await waitIdle(page);
  await hideLoadingOverlay(page);
  await page.waitForTimeout(3000);

  await expect(page.locator('app-nav')).toBeVisible({ timeout: 60_000 });
}