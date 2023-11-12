import { Page } from '@playwright/test';

export default class WaitManager {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async waitForLoad(waitingTime: number= 5000) {
    await this.page.waitForLoadState('load', { timeout: waitingTime });
  }
  public async waitForTimeOut(waitingTime: number= 2000) {
    await this.page.waitForTimeout(waitingTime);
  }

  public async waitForDomContentLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  public async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  public async waitForURL(url: string) {
    await this.page.waitForURL(url);
  }

  public async waitForElement(selector: string) {
    if (!(await this.page.waitForSelector(selector))) {
      for (let index = 0; index < 5; index++) {
        await this.page.waitForSelector(selector);
      }
    }
  }
}
