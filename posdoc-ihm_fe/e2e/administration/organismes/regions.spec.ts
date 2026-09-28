import { expect, test } from 'e2e/common/fixtures';
import type { Page } from '@playwright/test';
import { E2EUtils } from 'e2e/common/E2EUtils';

const code = '02E';
const libelle = 'Region e2e';
const libelleToUpdate = 'Region e2e updated';

test('créer une région', async ({ page }) => {
  await createRegion(page);
});

test('modifier une région', async ({ page }) => {
  await updateRegion(page);
});

test('supprimer une région', async ({ page }) => {
  await deleteRegion(page);
});

async function createRegion(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Organismes' }).first().click();
  await page.getByRole('tab', { name: 'Régions' }).click();
  // add row
  await E2EUtils.clickButton(page, 'Ajouter');
  await E2EUtils.fillInputGridCell(page, 'code', code);
  await E2EUtils.fillInputGridCell(page, 'libelle', libelle);
  await E2EUtils.clickButton(page, 'Enregistrer');
  await E2EUtils.waitForAlertVisible(page);
  // row added
  await expect(E2EUtils.getLocatorGridRowByText(page, [code])).toHaveCount(1);
}

async function updateRegion(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Organismes' }).first().click();
  await page.getByRole('tab', { name: 'Régions' }).click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, code);
  // edit row
  await E2EUtils.clickGridIconeEditByText(page, [code]);
  await page.waitForTimeout(500);
  await E2EUtils.fillInputGridCell(page, 'libelle', libelleToUpdate);
  await E2EUtils.clickButton(page, 'Enregistrer');
  await E2EUtils.waitForAlertVisible(page);
  // row edited
  await expect(page.locator('div.ag-cell[col-id="libelle"]', { hasText: libelleToUpdate })).toHaveCount(1);
}

async function deleteRegion(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Organismes' }).first().click();
  await page.getByRole('tab', { name: 'Régions' }).click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, code);
  // delete row
  await E2EUtils.clickGridIconeDeleteByText(page, [code]);
  await E2EUtils.clickButton(page, 'Confirmer suppression');
  await E2EUtils.waitForAlertVisible(page);
  // row deleted
  await expect(E2EUtils.getLocatorGridRowByText(page, [code])).toHaveCount(0);
}
