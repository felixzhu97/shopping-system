// Initialize Datadog Lambda wrapper before other imports
import { datadog } from 'datadog-lambda-js';
import serverless from 'serverless-http';
import app from './index'; // 导入Express应用

// Wrap the handler with Datadog Lambda wrapper
const serverlessHandler = serverless(app, {
  binary: ['application/octet-stream', 'image/*'],
});

// Export Lambda handler wrapped with Datadog
export const handler = datadog(serverlessHandler);
