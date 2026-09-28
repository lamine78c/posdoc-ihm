import { expect, test } from 'e2e/common/fixtures';
import type { Page } from '@playwright/test';
import { E2EUtils } from 'e2e/common/E2EUtils';

const title = 'Message Test e2e ';
const contenu = 'Ceci est un message de test ';
const titleToUpdate = 'Message Test e2e modifié';
const contenuToUpdate = 'Ceci est un message de test modifié';

test("créer un message sur la page d'accueil", async ({ page }) => {
  await createMessage(page);
});

test("modifier un message sur la page d'accueil", async ({ page }) => {
  await modifyMessage(page);
});

test("supprimer un message sur la page d'accueil", async ({ page }) => {
  await deleteMessage(page);
});

async function createMessage(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Contenus' }).first().click();
  await page.getByRole('tab', { name: "Pages d'accueil" }).click();
  // add row
  await E2EUtils.clickButton(page, 'Ajouter');
  await page.locator('input#input5').fill(title);
  await page.locator('div.ql-editor').click();
  await page.keyboard.type(contenu);
  await E2EUtils.clickButton(page, 'Enregistrer');
  await E2EUtils.waitForAlertVisible(page);
  // row added
  await expect(E2EUtils.getLocatorGridRowByText(page, [title, contenu])).toHaveCount(1);
}

async function modifyMessage(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Contenus' }).first().click();
  await page.getByRole('tab', { name: "Pages d'accueil" }).click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, title);
  await E2EUtils.clickGridRowByText(page, [title]);
  // edit row
  await E2EUtils.clickButton(page, 'Modifier');
  await page.waitForTimeout(500);
  await page.locator('input#input5').fill(titleToUpdate);
  await page
    .locator('.form.row')
    .filter({
      has: page.getByText('Région'),
    })
    .locator('.dropdown-toggle')
    .click();
  await page.locator('.dropdown-menu.show .form-check').first().locator('input[type="checkbox"]').check();
  await page.locator('div.ql-editor').click();
  await page.keyboard.type(' modifié');
  await E2EUtils.clickButton(page, 'Enregistrer');
  await E2EUtils.waitForAlertVisible(page);
  // row edited
  await expect(E2EUtils.getLocatorGridRowByText(page, [titleToUpdate, contenuToUpdate])).toHaveCount(1);
}

async function deleteMessage(page: Page) {
  await page.getByText('ADMINISTRATION').click();
  await page.locator('span').filter({ hasText: 'Contenus' }).first().click();
  await page.getByRole('tab', { name: "Pages d'accueil" }).click();
  // find row
  await E2EUtils.fillToFirstGridSearch(page, titleToUpdate);
  await E2EUtils.clickGridRowByText(page, [titleToUpdate]);
  // delete row
  await E2EUtils.clickButton(page, 'Supprimer');
  await E2EUtils.clickButton(page, 'Confirmer suppression');
  await E2EUtils.waitForAlertVisible(page);
  // row deleted
  await expect(E2EUtils.getLocatorGridRowByText(page, [titleToUpdate, contenuToUpdate])).toHaveCount(0);
}

