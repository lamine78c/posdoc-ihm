import { expect, test } from 'e2e/common/fixtures';
import type { Page } from '@playwright/test';
import { E2EUtils } from 'e2e/common/E2EUtils';

const code = 'E2E';
const libelle = 'Organisme e2e';
const adresse1 = 'adresse1';
const adresse2 = 'adresse2';
const adresse3 = 'adresse3';
const adresse4 = 'adresse4';
const libelleToUpdate = 'Organisme e2e updated';

test('créer un organisme', async ({ page }) => {
  await createOrganisme(page);
});

test('modifier un organisme', async ({ page }) => {
  await updateOrganisme(page);
});

test('supprimer un organisme', async ({ page }) => {
  await deleteOrganisme(page);
});

async function createOrganisme(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Organismes' }).first().click();
  await page.getByRole('tab', { name: 'Organismes' }).click();
  // add row
  await E2EUtils.clickButton(page, 'Ajouter');
  await E2EUtils.fillInputGridCell(page, 'code', code);
  await E2EUtils.fillInputGridCell(page, 'libelle', libelle);
  await E2EUtils.fillInputGridCell(page, 'adresse1', adresse1);
  await E2EUtils.fillInputGridCell(page, 'adresse2', adresse2);
  await E2EUtils.fillInputGridCell(page, 'adresse3', adresse3);
  await E2EUtils.fillInputGridCell(page, 'adresse4', adresse4);
  await E2EUtils.selectFirstOptionGridCell(page, 'type');
  await E2EUtils.clickButton(page, 'Enregistrer');
  await E2EUtils.waitForAlertVisible(page);
  // row added
  await expect(E2EUtils.getLocatorGridRowByText(page, [code])).toHaveCount(1);
}

async function updateOrganisme(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Organismes' }).first().click();
  await page.getByRole('tab', { name: 'Organismes' }).click();
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

async function deleteOrganisme(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Organismes' }).first().click();
  await page.getByRole('tab', { name: 'Organismes' }).click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, code);
  // delete row
  await E2EUtils.clickGridIconeDeleteByText(page, [code]);
  await E2EUtils.clickButton(page, 'Confirmer suppression');
  await E2EUtils.waitForAlertVisible(page);
  // row deleted
  await expect(E2EUtils.getLocatorGridRowByText(page, [code])).toHaveCount(0);
}
