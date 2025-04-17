import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '购物系统 API',
      version: '1.0.0',
      description: '购物系统的API文档',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: '开发服务器',
      },
    ],
  },
  apis: [path.resolve(__dirname, './routes/*.ts')],
};

const specs = swaggerJsdoc(options);

/**
 * 配置Swagger到Express应用
 * @param app Express应用实例
 */
export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

export default specs;
