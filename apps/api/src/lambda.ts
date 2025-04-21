import serverless from 'serverless-http';
import app from './index'; // 导入Express应用

// 导出Lambda处理函数
export const handler = serverless(app, {
  binary: ['application/octet-stream', 'image/*'],
});
