import { expect, test } from 'e2e/common/fixtures';
import type { Page } from '@playwright/test';
import { E2EUtils } from 'e2e/common/E2EUtils';

const code = 'E2E';
const host = 'e2e.cer31.recouv';
const username = 'usere2e';
const password = 'mdpe2e';
const usernameToUpdate = 'ue2e';

test('créer un site', async ({ page }) => {
  await createSite(page);
});

test('modifier un site', async ({ page }) => {
  await updateSite(page);
});

test('supprimer un site', async ({ page }) => {
  await deleteSite(page);
});

async function createSite(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Organismes' }).first().click();
  await page.getByRole('tab', { name: 'Sites' }).click();
  // add row
  await E2EUtils.clickButton(page, 'Ajouter');
  await E2EUtils.fillInputGridCell(page, 'code', code);
  await E2EUtils.fillInputGridCell(page, 'host', host);
  await E2EUtils.selectFirstOptionGridCell(page, 'ressourceDelestage');
  await E2EUtils.fillInputGridCell(page, 'username', username);
  await E2EUtils.fillInputGridCell(page, 'password', password);
  const selctorOrgMas = await E2EUtils.getGridCell(page, 'organismeMassification').locator('[id^="dropdownFormH"]').first();
  await Promise.all([expect(selctorOrgMas).toBeVisible(), selctorOrgMas.click()]);
  // Wait for modal to appear in the DOM and be visible
  const firstOptionOrgMas = page.locator('label[for^="radio-group-"]').first();
  await Promise.all([expect(firstOptionOrgMas).toBeVisible(), firstOptionOrgMas.click()]);
  await E2EUtils.clickButton(page, 'Enregistrer');
  await E2EUtils.waitForAlertVisible(page);
  // row added
  await expect(E2EUtils.getLocatorGridRowByText(page, [code])).toHaveCount(1);
}

async function updateSite(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Organismes' }).first().click();
  await page.getByRole('tab', { name: 'Sites' }).click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, code);
  // edit row
  await E2EUtils.clickGridIconeEditByText(page, [code]);
  await page.waitForTimeout(500);
  await E2EUtils.fillInputGridCell(page, 'username', usernameToUpdate);
  await E2EUtils.clickButton(page, 'Enregistrer');
  await E2EUtils.waitForAlertVisible(page);
  // row edited
  await expect(page.locator('div.ag-cell[col-id="username"]', { hasText: usernameToUpdate })).toHaveCount(1);
}

async function deleteSite(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Organismes' }).first().click();
  await page.getByRole('tab', { name: 'Sites' }).click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, code);
  // delete row
  await E2EUtils.clickGridIconeDeleteByText(page, [code]);
  await E2EUtils.clickButton(page, 'Confirmer suppression');
  await E2EUtils.waitForAlertVisible(page);
  // row deleted
  await expect(E2EUtils.getLocatorGridRowByText(page, [code])).toHaveCount(0);
}
