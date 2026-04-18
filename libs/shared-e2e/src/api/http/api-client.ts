import { APIRequestContext, APIResponse, request } from '@playwright/test';

export interface RequestOptions {
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

/**
 * Lightweight API client that returns the raw APIResponse so tests
 * can assert on any status code — not just 200.
 */
export class ApiClient {
  private context: APIRequestContext | null = null;

  constructor(private readonly baseURL: string) {}

  private async getContext(): Promise<APIRequestContext> {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: this.baseURL,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      });
    }
    return this.context;
  }

  async get(path: string, opts: RequestOptions = {}): Promise<APIResponse> {
    const ctx = await this.getContext();
    return ctx.get(path, { headers: opts.headers, params: opts.params });
  }

  async post(path: string, opts: RequestOptions = {}): Promise<APIResponse> {
    const ctx = await this.getContext();
    return ctx.post(path, { headers: opts.headers, data: opts.body });
  }

  async put(path: string, opts: RequestOptions = {}): Promise<APIResponse> {
    const ctx = await this.getContext();
    return ctx.put(path, { headers: opts.headers, data: opts.body });
  }

  async patch(path: string, opts: RequestOptions = {}): Promise<APIResponse> {
    const ctx = await this.getContext();
    return ctx.patch(path, { headers: opts.headers, data: opts.body });
  }

  async delete(path: string, opts: RequestOptions = {}): Promise<APIResponse> {
    const ctx = await this.getContext();
    return ctx.delete(path, { headers: opts.headers });
  }

  async dispose() {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }
}
