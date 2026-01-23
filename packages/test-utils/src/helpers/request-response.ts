import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, MockRequestOptions, MockResponseOptions } from '../mocks/http';

export { createMockRequest, createMockResponse };
export type { MockRequestOptions, MockResponseOptions };

/**
 * 创建 Mock Express 请求和响应对象的快捷方法
 */
export function createMockReqRes(
  requestOptions: MockRequestOptions = {},
  responseOptions: MockResponseOptions = {}
): { req: Partial<Request>; res: Partial<Response> } {
  return {
    req: createMockRequest(requestOptions),
    res: createMockResponse(responseOptions),
  };
}
