import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock controllers
vi.mock('../../controllers/userController', () => ({
  register: vi.fn(),
  login: vi.fn(),
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  resetPassword: vi.fn(),
}));

// Mock middleware
vi.mock('../../middleware/adminAuth', () => ({
  adminAuth: vi.fn((req: any, res: any, next: any) => next()),
}));

import * as userController from '../../controllers/userController';
import { adminAuth } from '../../middleware/adminAuth';

let app: express.Application;

beforeEach(async () => {
  vi.clearAllMocks();

  app = express();
  app.use(express.json());

  const { default: userRoutes } = await import('../../routes/users.js');
  app.use('/api/users', userRoutes);
});

describe('Users Routes', () => {
  it('should handle POST /api/users/register', async () => {
    (userController.register as any).mockImplementation((req: any, res: any) => {
      res.status(201).json({ message: 'User registered' });
    });

    const response = await request(app)
      .post('/api/users/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(201);
    expect(userController.register).toHaveBeenCalled();
  });

  it('should handle POST /api/users/login', async () => {
    (userController.login as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ token: 'fake-token' });
    });

    const response = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(userController.login).toHaveBeenCalled();
  });

  it('should handle GET /api/users/:id', async () => {
    (userController.getUserById as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ id: req.params.id });
    });

    const response = await request(app).get('/api/users/user123');

    expect(response.status).toBe(200);
    expect(userController.getUserById).toHaveBeenCalled();
  });

  it('should handle PUT /api/users/:id', async () => {
    (userController.updateUser as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ message: 'Profile updated' });
    });

    const response = await request(app).put('/api/users/user123').send({ firstName: 'John' });

    expect(response.status).toBe(200);
    expect(userController.updateUser).toHaveBeenCalled();
  });

  it('should handle POST /api/users/reset-password', async () => {
    (userController.resetPassword as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ message: 'Password reset successful' });
    });

    const response = await request(app)
      .post('/api/users/reset-password')
      .send({ emailOrPhone: 'test@example.com', newPassword: 'newPassword123' });

    expect(response.status).toBe(200);
    expect(userController.resetPassword).toHaveBeenCalled();
  });
});
