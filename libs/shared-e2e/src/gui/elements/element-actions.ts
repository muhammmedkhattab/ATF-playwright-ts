import { Page } from '@playwright/test';
import WaitManager from './wait-manager';
import DynamicLocators from '../../data/locators/dynamic.data.elements.json';

const errorMessage = ' was not found!';
const timeOut = 10000;
export default class ElementActions {
  private page: Page;
  waitManager: WaitManager;

  constructor(page: Page) {
    this.page = page;

    this.waitManager = new WaitManager(this.page);
  }

  public async basicClick(selector: string) {
    await this.page.click(selector);
  }

  public async click(selector: string) {
    const element = this.page.locator(selector);
    if(await element.isVisible()){
      await element.click();
    }
  }
  public async clickByTestId(selector: string) {
    try {
      await this.page.getByTestId(selector).click();
    } catch (e) {
      const element = this.page.getByTestId(selector);
      await element.waitFor({ state: 'visible', timeout: timeOut });
      await this.page.getByTestId(selector).click();
    }
  }

  public async clickChildByTestId(parentSelector: string, selector: string) {
    try {
      await this.page.getByTestId(parentSelector).getByTestId(selector).click();
    } catch (e) {
      const element = this.page.getByTestId(parentSelector).getByTestId(selector);
      await element.waitFor({ state: 'visible', timeout: timeOut });
      await element.click();
    }
  }

  public async forceClick(selector: string) {
    await this.waitManager.waitForDomContentLoad();
    if (await this.page.isVisible(selector)) {
      const element = this.page.locator(selector);
      await element.waitFor();
      await this.page.click(selector, { force: true });
    } else console.log('Error: ', Error, 'Element:', selector, `${errorMessage}`);
  }

  public async hover(selector: string) {
    await this.waitManager.waitForDomContentLoad();
    if (await this.page.isVisible(selector)) {
      await this.page.hover(selector);
    } else console.log('Error: ', Error, 'Element:', selector, `${errorMessage}`);
  }

  public async fill(selector: string, value: string) {
    if (await this.page.isVisible(selector)) {
      await this.page.fill(selector, value);
    } else console.log(Error, 'Element:', selector, `${errorMessage}`);
  }

  public async clear(selector: string) {
    if (await this.page.isVisible(selector)) {
      await this.page.locator(selector).clear();
    } else console.log(Error, 'Element:', selector, `${errorMessage}`);
  }

  public async upload(selector: string, fileNameWithExtension: string) {
    await this.page.setInputFiles(selector, `data/documents/${fileNameWithExtension}`);
    await this.page.locator(DynamicLocators.uploadZoneLocator).isVisible();
  }

  public async select(selector: string, option: string) {
    if (await this.page.isVisible(selector)) {
      const dropdown = await this.page.$(selector);
      await dropdown?.selectOption(option);
    } else console.log(Error, 'Element:', selector, `${errorMessage}`);
  }

  public async waitIframeAndClick(iframeSelector: string, childSelector: string) {
    await this.waitManager.waitForDomContentLoad();
    await this.waitManager.waitForElement(iframeSelector);
    await this.page.frameLocator(iframeSelector).locator(childSelector).click();
  }

  public async waitIframeAndFill(iframeSelector: string, childSelector: string, value: string) {
    await this.waitManager.waitForDomContentLoad();
    await this.waitManager.waitForElement(iframeSelector);
    await this.page.frameLocator(iframeSelector).locator(childSelector).fill(value);
  }

  public async navigateToUrl(url: string) {
    await this.waitManager.waitForLoad();
    await this.page.goto(url);
  }
  public async switchContextToIframe(selector: string) {
    await this.page.waitForLoadState('load');
    const getElement = await this.page.$(selector);
    const iframe = await getElement!.contentFrame();
    if (iframe !== null) {
      return iframe;
    }
    throw new Error('iFrame Not Found');
  }

}
