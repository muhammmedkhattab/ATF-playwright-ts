import { Page, test } from '@playwright/test';
type PlatformType = 'web' | 'mobile';
export default class ApiSteps {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}
