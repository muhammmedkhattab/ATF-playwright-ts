import { Page, test } from '@playwright/test';
import { envConfig } from './env-config';

const intEnvURL = envConfig['staging'];
const prodEnvURL = envConfig['production'];
const kubeEnvURL = envConfig['kube'];
const localhostEnvURL = envConfig['localhost'];

const envMapper = new Map<string, string>([
  ['staging'.toLowerCase(), intEnvURL],
  ['production'.toLowerCase(), prodEnvURL],
  ['localhost'.toLowerCase(), localhostEnvURL],
]);

export default class EnvUtils {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async goto() {
    const ENV = process.env['ENV'] as string;
    await test.step(`Navigate to [${ENV}] portal`, async () => {
      const getEnv = envMapper.get(ENV);
      await this.page.goto(String(getEnv));
    });
  }
}
