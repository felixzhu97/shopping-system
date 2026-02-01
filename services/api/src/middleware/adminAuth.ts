import { NextFunction, Request, Response } from 'express';

function getFirstString(value: unknown): string {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : '';
  }
  return typeof value === 'string' ? value : '';
}

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const request = req as any;
  const query = (request.query ?? {}) as Record<string, unknown>;
  const adminSecret =
    getFirstString(request.headers?.['admin-secret']) ||
    getFirstString(request.get?.('admin-secret')) ||
    getFirstString(request.header?.('admin-secret')) ||
    getFirstString(query['admin-secret']) ||
    getFirstString(query.adminSecret);
  const configuredSecret = process.env.ADMIN_SECRET;

  if (!configuredSecret) {
    res.status(500).json({ message: 'Admin secret is not configured' });
    return;
  }

  if (!adminSecret) {
    res.status(403).json({ message: 'Missing admin-secret header' });
    return;
  }

  if (adminSecret !== configuredSecret) {
    res.status(403).json({ message: 'Invalid admin secret' });
    return;
  }

  next();
}