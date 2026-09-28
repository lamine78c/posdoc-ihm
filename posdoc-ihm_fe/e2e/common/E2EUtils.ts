import { expect, Locator, Page } from '@playwright/test';

export class E2EUtils {
  static getGridCell(page: Page, colId: string) {
    return page
      .locator('div.ag-center-cols-container div.ag-row')
      .first()
      .locator('div.ag-cell[col-id="' + colId + '"]')
      .first();
  }

  static async selectFirstOptionGridCell(page: Page, colId: string) {
    const selector = this.getGridCell(page, colId).locator('select');
    await Promise.all([expect(selector).toBeVisible(), selector.selectOption({ index: 1 })]);
  }

  static async selectOptionGridCell(page: Page, colId: string, option: string) {
    const selector = this.getGridCell(page, colId).locator('select');
    await Promise.all([expect(selector).toBeVisible(), selector.selectOption(option)]);
  }

  static async fillInputGridCell(page: Page, colId: string, value: string) {
    const input = this.getGridCell(page, colId).locator('input');
    await Promise.all([expect(input).toBeVisible(), input.click(), input.fill(value)]);
  }

  static async fillToFirstGridSearch(page: Page, text: string) {
    const locator = page.getByRole('textbox', { name: 'Rechercher...' }).first();
    await Promise.all([expect(locator).toBeVisible(), locator.click(), locator.fill(text)]);
  }

  static async scrollToRow(page: Page, row: Locator) {
    const container = page.locator('.ag-body-viewport').first();
    await expect(container).toBeVisible();

    for (let i = 0; i < 50; i++) {
      if ((await row.count()) > 0) {
        await row.first().scrollIntoViewIfNeeded();
        return row.first();
      }

      try {
        await container.evaluate(el => el.scrollBy({ top: 300, behavior: 'smooth' }));
      } catch (error) {
        console.warn('Erreur lors du scroll :', error);
      }

      await page.waitForTimeout(200);
    }

    throw new Error('Ligne non trouvée après scroll');
  }

  static getLocatorByText(page: Page, selector: string, textFilters: string[]): Locator {
    let locator = page.locator(selector);
    textFilters.forEach(filter => {
      locator = locator.filter({ hasText: filter });
    });
    return locator.first();
  }

  static getLocatorGridRowByText(page: Page, textFilters: string[]): Locator {
    return this.getLocatorByText(page, 'div.ag-center-cols-container div.ag-row', textFilters);
  }

  static async clickButton(page: Page, nameButton: string) {
    await page.waitForTimeout(500);
    const button = page.getByRole('button', { name: nameButton }).first();
    await Promise.all([expect(button).toBeVisible(), button.click()]);
  }

  static async clickElementByText(page: Page, text: string) {
    const locator = page.getByText(text).first();
    await Promise.all([expect(locator).toBeVisible(), locator.click()]);
  }

  static async clickGridRowByText(page: Page, textFilters: string[]) {
    const gridRow = this.getLocatorGridRowByText(page, textFilters);
    await Promise.all([expect(gridRow).toBeVisible(), gridRow.click()]);
  }

  static async clickGridIconeEditByText(page: Page, textFilters: string[]) {
    const gridRow = this.getLocatorGridRowByText(page, textFilters);
    await Promise.all([expect(gridRow).toBeVisible(), gridRow.getByTitle('Editer').click()]);
  }

  static async clickGridIconeDeleteByText(page: Page, textFilters: string[]) {
    const gridRow = this.getLocatorGridRowByText(page, textFilters);
    await Promise.all([expect(gridRow).toBeVisible(), gridRow.locator('div.ag-cell[col-id="isNotAuthorisedToBeDeleted"]').click()]);
  }

  static async waitForAlertVisible(page: Page) {
    await expect(page.getByRole('alert').last()).toBeVisible();
    await page.waitForTimeout(500);
  }
}
