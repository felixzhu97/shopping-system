declare module "express" {
  import express from "express";

  export interface Request {
    body: any;
    params: any;
    query: any;
  }

  export interface Response {
    status(code: number): Response;
    json(body: any): Response;
    send(body: any): Response;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export default express;
}

declare module "cors" {
  function cors(options?: any): any;
  export default cors;
}
