import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 管理员认证中间件
 * 验证请求头中的admin-secret是否与环境变量中的ADMIN_SECRET匹配
 */
export const adminAuth = (
  req: express.Request, 
  res: express.Response, 
  next: express.NextFunction
) => {
  const adminSecret = req.headers['admin-secret'] as string;
  const envAdminSecret = process.env.ADMIN_SECRET;

  // 如果环境变量中没有设置ADMIN_SECRET，返回服务器配置错误
  if (!envAdminSecret) {
    console.error('服务器配置错误: 未设置ADMIN_SECRET环境变量');
    return res.status(500).json({ message: '服务器配置错误' });
  }

  // 验证admin-secret
  if (!adminSecret || adminSecret !== envAdminSecret) {
    return res.status(403).json({ message: '没有管理员权限' });
  }

  // 验证通过，继续执行后续中间件
  next();
}; 