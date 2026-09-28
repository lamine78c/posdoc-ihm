import { expect, test } from 'e2e/common/fixtures';
import type { Page } from '@playwright/test';
import { E2EUtils } from 'e2e/common/E2EUtils';

const code = 'Y';
const libelle = 'ENV DE TEST Y';
const libelleToUpdate = 'ENVY';

test('créer un environnement', async ({ page }) => {
  await createEnv(page);
});

test('modifier un environnement', async ({ page }) => {
  await updateEnv(page);
});

test('supprimer un environnement', async ({ page }) => {
  await deleteEnv(page);
});

async function createEnv(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Environnements' }).first().click();
  // add row
  await E2EUtils.clickButton(page, 'Ajouter');
  await E2EUtils.fillInputGridCell(page, 'code', code);
  await E2EUtils.fillInputGridCell(page, 'libelle', libelle);
  await E2EUtils.clickButton(page, 'Enregistrer');
  await E2EUtils.waitForAlertVisible(page);
  // row added
  await expect(E2EUtils.getLocatorGridRowByText(page, [code])).toHaveCount(1);
}

async function updateEnv(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Environnements' }).first().click();
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

async function deleteEnv(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Environnements' }).first().click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, code);
  // delete row
  await E2EUtils.clickGridIconeDeleteByText(page, [code]);
  await E2EUtils.clickButton(page, 'Confirmer suppression');
  await E2EUtils.waitForAlertVisible(page);
  // row deleted
  await expect(E2EUtils.getLocatorGridRowByText(page, [code])).toHaveCount(0);
}
