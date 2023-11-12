import { request, expect } from '@playwright/test';

export default class HttpMethods {
  public async getRequest(url: string, service: string, header?: { [key: string]: string }) {
    const context = await request.newContext({
      baseURL: url,
      extraHTTPHeaders: header,
    });

    const response = await context.get(service, {
      headers: {
        Accept: 'application/json',
      },
    });
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    return response.json();
  }

  public async postRequest(
    url: string,
    service: string,
    body?: { [key: string]: any },
    header?: { [key: string]: string },
  ) {
    const context = await request.newContext({
      baseURL: url,
      extraHTTPHeaders: header,
    });

    const response = await context.post(service, {
      headers: {
        Accept: '*/*',
        ContentType: 'application/json',
      },

      data: body,
    });
    expect(response.ok()).toBeTruthy();
    try {
      const saveBody = await response.json();
      if (saveBody === null || saveBody !== null) {
        return saveBody;
      }
    } catch (e) {
      return e;
    }
  }
}
