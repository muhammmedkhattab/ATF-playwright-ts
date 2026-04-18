import { Page, Locator } from '@playwright/test';

export class SauceDemoLoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  static readonly URL = 'https://www.saucedemo.com/';

  static readonly Users = {
    standard: { username: 'standard_user', password: 'secret_sauce' },
    lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
    problem: { username: 'problem_user', password: 'secret_sauce' },
  };

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async goto() {
    await this.page.goto(SauceDemoLoginPage.URL);
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
