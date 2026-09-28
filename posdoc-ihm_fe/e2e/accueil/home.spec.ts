import { expect, test } from 'e2e/common/fixtures';

test('homepage should have welcome message', async ({ page }) => {
  await page.goto('/accueil');
  await expect(page.locator('app-nav')).toBeVisible();
});
