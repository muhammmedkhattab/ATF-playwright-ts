import utils from 'util';
import { Page, expect } from '@playwright/test';
import dynamicElements from '../../data/locators/dynamic.data.elements.json';
import WaitManager from './wait-manager';

export default class Asserts {
  private page: Page;

  private waitManager: WaitManager;

  private TIME_OUT = 2000;

  constructor(page: Page) {
    this.page = page;
    this.waitManager = new WaitManager(this.page);
  }

  public async assertTextLocator(selectorText: string, uiText: string) {
    await this.waitManager.waitForLoad();
    const element = utils.format(dynamicElements.getTextLocator, selectorText);
    await this.waitManager.waitForElement(element);
    const locator = this.page.locator(element);
    await expect(locator).toHaveText(uiText);
  }

  public async assertTextLocatorWithIndex(selectorText: string, uiText: string, index: number) {
    await this.waitManager.waitForLoad();
    const element = utils.format(dynamicElements.getTextByIndexAndLocator, selectorText, index);
    await this.waitManager.waitForElement(element);
    const locator = this.page.locator(element);
    await expect(locator).toHaveText(uiText);
  }

  public async assertLocatorByText(uiText: string) {
    await this.waitManager.waitForLoad();
    const element = utils.format(dynamicElements.getTextLocator, uiText);
    await this.waitManager.waitForElement(element);
    await expect(this.page.locator(element)).toBeVisible();
  }

  public async assertLocatorByTextAndIndex(uiText: string, index: number) {
    await this.waitManager.waitForLoad();
    const element = utils.format(dynamicElements.getTextByIndexAndLocator, uiText, index);
    await this.waitManager.waitForElement(element);
    await expect(this.page.locator(element)).toBeVisible();
  }

  public async assertLocatorInnerText(selector: string, expectedText: string) {
    await this.waitManager.waitForLoad();
    await this.waitManager.waitForElement(selector);
    const element = this.page.locator(selector);
    await expect(element).toContainText(expectedText);
  }

  public async assertInnerTextByTestId(selector: string, expectedText: string) {
    await this.waitManager.waitForLoad();
    await this.waitManager.waitForElement(selector);
    const element = this.page.getByTestId(selector);
    await expect(element).toHaveText(expectedText);
  }

  public async assertPartialText(selector: string, expectedText: string) {
    await this.waitManager.waitForLoad();
    await this.waitManager.waitForElement(selector);
    const getText = this.page.locator(selector);
    await expect(getText).toHaveText(expectedText);
  }

  public async assertVisibleElement(selector: string) {
    await this.waitManager.waitForLoad();
    await expect(this.page.locator(selector)).toBeVisible();
  }

  public async assertInvisibleElement(selector: string) {
    await this.waitManager.waitForLoad();
    await expect(this.page.locator(selector)).not.toBeVisible();
  }

  public async assertHiddenElement(selector: string) {
    await this.waitManager.waitForLoad();
    await expect(this.page.locator(selector)).toBeHidden();
  }

  public async assertUrlContains(url: string) {
    await this.waitManager.waitForLoad();
    expect(this.page.url()).toContain(url);
  }

  public async assertElementInIframe(iframeSelector: string, selector: string) {
    await this.waitManager.waitForLoad();
    const iframe = this.page.frameLocator(iframeSelector);
    await expect(iframe.locator(selector)).toBeVisible();
  }

  public async assertElementNotInIframe(iframeSelector: string, selector: string) {
    await this.waitManager.waitForLoad();
    const iframe = this.page.frameLocator(iframeSelector);
    await expect(iframe.locator(selector)).not.toBeVisible();
  }

  public async assertTextInIframe(iframeSelector: string, uiText: string) {
    await this.waitManager.waitForLoad();
    const element = utils.format(dynamicElements.getTextLocator, uiText);
    await expect(this.page.frameLocator(iframeSelector).locator(element)).toBeVisible();
  }

  public async assertLocatorTextInIframe(iframeSelector: string, selector: string, uiText: string) {
    await this.waitManager.waitForLoad();
    await this.waitManager.waitForElement(iframeSelector);
    const element = this.page.frameLocator(iframeSelector).locator(selector);
    await expect(element).toContainText(uiText);
  }
}
