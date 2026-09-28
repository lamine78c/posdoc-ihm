import { expect, test } from 'e2e/common/fixtures';
import type { Page } from '@playwright/test';
import { E2EUtils } from 'e2e/common/E2EUtils';

const codnot = 'TESTE2E';
const libnot = 'Notice TESTE2E';
const libnotToUpdated = 'Notice TESTE2E updated';
const fornot = 'DL';
const poinot = '20';

test('créer une notice', async ({ page }) => {
  await createNotice(page);
});

test('modifier une notice', async ({ page }) => {
  await modifyNotice(page);
});

test('supprimer une notice', async ({ page }) => {
  await deleteNotice(page);
});

async function createNotice(page: Page) {
  await page.getByText("GESTION DES FICHIERS D'EDITION").click();
  await page.locator('span').filter({ hasText: 'Notices' }).first().click();
  await page.getByRole('tab', { name: 'Notices actives' }).click();
  // add row
  await E2EUtils.clickButton(page, 'Ajouter');
  await E2EUtils.fillInputGridCell(page, 'codnot', codnot);
  await E2EUtils.fillInputGridCell(page, 'libnot', libnot);
  await E2EUtils.fillInputGridCell(page, 'fornot', fornot);
  await E2EUtils.fillInputGridCell(page, 'poinot', poinot);
  await E2EUtils.selectFirstOptionGridCell(page, 'pornot');
  await E2EUtils.selectFirstOptionGridCell(page, 'codsit');
  await E2EUtils.clickButton(page, 'Enregistrer');
  await E2EUtils.waitForAlertVisible(page);
  // row added
  await expect(E2EUtils.getLocatorGridRowByText(page, [codnot])).toHaveCount(1);
}

async function modifyNotice(page: Page) {
  await page.getByText("GESTION DES FICHIERS D'EDITION").click();
  await page.locator('span').filter({ hasText: 'Notices' }).first().click();
  await page.getByRole('tab', { name: 'Notices actives' }).click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, codnot);
  const rowToModify = page.locator('div.ag-center-cols-container div.ag-row').filter({
    has: page.locator('div.ag-cell[col-id="codnot"]', { hasText: codnot }),
  });
  await expect(rowToModify).toHaveCount(1);
  // edit row
  await E2EUtils.clickGridIconeEditByText(page, [codnot]);
  await page.waitForTimeout(500);
  await E2EUtils.fillInputGridCell(page, 'libnot', libnotToUpdated);
  await E2EUtils.clickButton(page, 'Enregistrer');
  await E2EUtils.waitForAlertVisible(page);
  // row edited
  await expect(page.locator('div.ag-cell[col-id="libnot"]', { hasText: libnotToUpdated })).toHaveCount(1);
  // set perime
  await rowToModify.locator('div.ag-cell[col-id="perime"]').click();
  await E2EUtils.waitForAlertVisible(page);
  // check row
  await expect(rowToModify).toHaveCount(0);

  // tab notices périmées
  await page.getByRole('tab', { name: 'Notices périmées' }).click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, codnot);
  await expect(rowToModify).toHaveCount(1);
  // set perime
  await rowToModify.locator('div.ag-cell[col-id="perime"]').click();
  await E2EUtils.waitForAlertVisible(page);
  // check row
  await expect(rowToModify).toHaveCount(0);

  // tab notices actives
  await page.getByRole('tab', { name: 'Notices actives' }).click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, codnot);
  await expect(rowToModify).toHaveCount(1);
}

async function deleteNotice(page: Page) {
  await page.getByText("GESTION DES FICHIERS D'EDITION").click();
  await page.locator('span').filter({ hasText: 'Notices' }).first().click();
  await page.getByRole('tab', { name: 'Notices actives' }).click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, codnot);
  // delete row
  await E2EUtils.clickGridIconeDeleteByText(page, [codnot]);
  await E2EUtils.clickButton(page, 'Confirmer suppression');
  await E2EUtils.waitForAlertVisible(page);
  // row deleted
  await expect(E2EUtils.getLocatorGridRowByText(page, [codnot])).toHaveCount(0);
}
