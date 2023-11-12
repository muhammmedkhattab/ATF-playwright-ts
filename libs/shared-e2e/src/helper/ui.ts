import { Page } from '@playwright/test';
import WaitManager from '../gui/elements/wait-manager';
const COLOR_GREEN='\x1b[32m';
const COLOR_BK_BLUE='\x1b[44m';
const COLOR_Reset='\x1b[0m';

export default class UiHelper {
  private page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  public createNewEmail() {
    let email ='';
    email = 'e2e-' + this.generateUuid() + '@test.de';
    console.log(`${COLOR_BK_BLUE} User Email: ${email} ${COLOR_Reset}`);
    return email;
  }

  private generateUuid() {
    let randomNumber:number;
    randomNumber = Math.floor(70000000 + Math.random() * 900000000  * 100);
    return randomNumber;
  }

  public async reloadPage() {
    await this.page.reload({ waitUntil: 'load' && 'domcontentloaded' && 'networkidle' });
  }

  public async navigateToURL(url: string) {
    const waitManager = new WaitManager(this.page);
    await waitManager.waitForNetworkIdle();
    await waitManager.waitForDomContentLoad();
    await this.page.goto(url, {
      waitUntil: 'networkidle',
    });
  }
  public async replaceInURL(replaceFrom: string,replacedTo: string='') {
    let getURL = this.page.url();
    const newURL= getURL?.replace(replaceFrom,replacedTo) as string;
    return newURL;
  }

  public convertAllTextToLowerCase(textToLowerCase: string) {
    return textToLowerCase.substring(0).toLowerCase();
  }

  public convertAllTextToUpperCase(textToUpperCase: string) {
    return textToUpperCase.substring(0).toUpperCase();
  }
}
