import { Page, test } from '@playwright/test';
type PlatformType = 'web' | 'mobile';
export default class UiSteps {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

 
  
}
