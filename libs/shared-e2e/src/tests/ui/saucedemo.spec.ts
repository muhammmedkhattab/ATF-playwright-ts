import { test, expect } from '@playwright/test';
import { SauceDemoLoginPage } from '../../pages/sauceDemoLoginPage';
import { InventoryPage } from '../../pages/inventoryPage';
import { CartPage } from '../../pages/cartPage';
import { CheckoutPage } from '../../pages/checkoutPage';

const { standard, lockedOut } = SauceDemoLoginPage.Users;

test.describe('SauceDemo UI Tests', () => {
  let loginPage: SauceDemoLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new SauceDemoLoginPage(page);
    await loginPage.goto();
  });

  // --- Authentication ---

  test('TC-UI-01: successful login with valid credentials', async ({ page }) => {
    await loginPage.login(standard.username, standard.password);

    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('TC-UI-02: login with locked-out user shows error', async () => {
    await loginPage.login(lockedOut.username, lockedOut.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('locked out');
  });

  test('TC-UI-03: login with invalid password shows error', async () => {
    await loginPage.login(standard.username, 'wrong_password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username and password do not match');
  });

  // --- Inventory ---

  test('TC-UI-04: inventory page displays 6 products', async ({ page }) => {
    await loginPage.login(standard.username, standard.password);
    const inventory = new InventoryPage(page);

    await expect(inventory.inventoryItems).toHaveCount(6);
  });

  test('TC-UI-05: adding item to cart updates cart badge', async ({ page }) => {
    await loginPage.login(standard.username, standard.password);
    const inventory = new InventoryPage(page);

    await inventory.addToCartButton('Sauce Labs Backpack').click();

    await expect(inventory.cartBadge).toHaveText('1');
  });

  test('TC-UI-06: adding multiple items accumulates cart count', async ({ page }) => {
    await loginPage.login(standard.username, standard.password);
    const inventory = new InventoryPage(page);

    await inventory.addToCartButton('Sauce Labs Backpack').click();
    await inventory.addToCartButton('Sauce Labs Bike Light').click();

    await expect(inventory.cartBadge).toHaveText('2');
  });

  test('TC-UI-07: removing item from inventory page updates cart badge', async ({ page }) => {
    await loginPage.login(standard.username, standard.password);
    const inventory = new InventoryPage(page);

    await inventory.addToCartButton('Sauce Labs Backpack').click();
    await inventory.addToCartButton('Sauce Labs Bike Light').click();
    // The button label changes to "Remove" after adding
    await inventory
      .page.locator('.inventory_item')
      .filter({ hasText: 'Sauce Labs Backpack' })
      .locator('[data-test^="remove"]')
      .click();

    await expect(inventory.cartBadge).toHaveText('1');
  });

  test('TC-UI-08: cart page shows added items', async ({ page }) => {
    await loginPage.login(standard.username, standard.password);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);

    await inventory.addToCartButton('Sauce Labs Backpack').click();
    await inventory.cartLink.click();

    await expect(cart.cartItems).toHaveCount(1);
    await expect(cart.itemName('Sauce Labs Backpack')).toBeVisible();
  });

  test('TC-UI-09: sorting products by price low to high reorders list', async ({ page }) => {
    await loginPage.login(standard.username, standard.password);
    const inventory = new InventoryPage(page);

    await inventory.sortBy('lohi');

    const prices = await page.locator('.inventory_item_price').allTextContents();
    const numericPrices = prices.map((p) => parseFloat(p.replace('$', '')));

    for (let i = 1; i < numericPrices.length; i++) {
      expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i - 1]);
    }
  });

  test('TC-UI-10: complete checkout flow shows confirmation', async ({ page }) => {
    await loginPage.login(standard.username, standard.password);
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await inventory.addToCartButton('Sauce Labs Backpack').click();
    await inventory.cartLink.click();
    await cart.checkoutButton.click();
    await checkout.fillShippingInfo('John', 'Doe', '12345');
    await checkout.finishButton.click();

    await expect(checkout.confirmationHeader).toHaveText('Thank you for your order!');
    await expect(page).toHaveURL(/checkout-complete/);
  });
});
