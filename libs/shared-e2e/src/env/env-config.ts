import testEnv from './test.env.data.json';

export const envConfig: EnvConfig = {
  staging: testEnv.environment.staging,
  localhost: testEnv.environment.localhost,
  production: testEnv.environment.production,
};
export type EnvConfig = Record<string, string>;
