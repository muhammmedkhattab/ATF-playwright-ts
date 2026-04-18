import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  removeButton(itemName: string): Locator {
    return this.page
      .locator('.cart_item')
      .filter({ hasText: itemName })
      .locator('button');
  }

  itemName(itemName: string): Locator {
    return this.page.locator('.cart_item').filter({ hasText: itemName }).locator('.inventory_item_name');
  }
}
