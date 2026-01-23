import { vi } from 'vitest';
import { Request, Response } from 'express';

export interface MockRequestOptions {
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string>;
  method?: string;
  url?: string;
  user?: any;
  cookies?: Record<string, string>;
}

export interface MockResponseOptions {
  status?: number;
  json?: any;
  headers?: Record<string, string>;
}

/**
 * 创建 Mock Express 请求对象
 */
export function createMockRequest(options: MockRequestOptions = {}): Partial<Request> {
  const {
    body = {},
    params = {},
    query = {},
    headers = {},
    method = 'GET',
    url = '/',
    user,
    cookies = {},
  } = options;

  return {
    body,
    params,
    query,
    headers,
    method,
    url,
    user,
    cookies,
    // Express Request 的其他常用属性
    ip: '127.0.0.1',
    protocol: 'http',
    hostname: 'localhost',
    path: url,
    originalUrl: url,
    baseUrl: '',
    route: undefined,
    get: vi.fn((header: string) => headers[header.toLowerCase()]),
    header: vi.fn((header: string) => headers[header.toLowerCase()]),
    accepts: vi.fn(),
    acceptsCharsets: vi.fn(),
    acceptsEncodings: vi.fn(),
    acceptsLanguages: vi.fn(),
    is: vi.fn(),
    range: vi.fn(),
    fresh: false,
    stale: true,
    xhr: false,
    secure: false,
    subdomains: [],
  } as any;
}

/**
 * 创建 Mock Express 响应对象
 */
export function createMockResponse(options: MockResponseOptions = {}): Partial<Response> {
  const response: any = {
    statusCode: options.status || 200,
    headers: options.headers || {},
    locals: {},
    status: vi.fn(function (this: any, code: number) {
      this.statusCode = code;
      return this;
    }),
    send: vi.fn(function (this: any, body?: any) {
      this.body = body;
      return this;
    }),
    json: vi.fn(function (this: any, body?: any) {
      this.body = body;
      return this;
    }),
    sendStatus: vi.fn(function (this: any, code: number) {
      this.statusCode = code;
      return this;
    }),
    cookie: vi.fn(function (this: any) {
      return this;
    }),
    clearCookie: vi.fn(function (this: any) {
      return this;
    }),
    redirect: vi.fn(function (this: any) {
      return this;
    }),
    render: vi.fn(function (this: any) {
      return this;
    }),
    sendFile: vi.fn(function (this: any) {
      return this;
    }),
    download: vi.fn(function (this: any) {
      return this;
    }),
    end: vi.fn(function (this: any) {
      return this;
    }),
    format: vi.fn(function (this: any) {
      return this;
    }),
    get: vi.fn((header: string) => response.headers[header.toLowerCase()]),
    set: vi.fn(function (this: any, header: string, value?: any) {
      if (typeof header === 'string') {
        response.headers[header.toLowerCase()] = value || '';
      }
      return this;
    }),
    header: vi.fn(function (this: any, header: string, value?: any) {
      if (typeof header === 'string') {
        response.headers[header.toLowerCase()] = value || '';
      }
      return this;
    }),
    type: vi.fn(function (this: any) {
      return this;
    }),
    vary: vi.fn(function (this: any) {
      return this;
    }),
    append: vi.fn(function (this: any) {
      return this;
    }),
    location: vi.fn(function (this: any) {
      return this;
    }),
    links: vi.fn(function (this: any) {
      return this;
    }),
    jsonp: vi.fn(function (this: any) {
      return this;
    }),
  };

  if (options.json) {
    response.json(options.json);
  }

  return response;
}
