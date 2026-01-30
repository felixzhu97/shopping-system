import { NextFunction, Request, Response } from 'express';

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const adminSecret = String(req.headers['admin-secret'] ?? '');
  const configuredSecret = process.env.ADMIN_SECRET;

  if (!configuredSecret) {
    res.status(500).json({ message: 'Admin secret is not configured' });
    return;
  }

  if (!adminSecret || adminSecret !== configuredSecret) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  next();
}