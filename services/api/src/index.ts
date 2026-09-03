import { initDatadogAPM } from 'monitoring';
initDatadogAPM();

import fs from 'fs';
import path from 'path';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { expressjwt } from 'express-jwt';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';

import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import productRoutes from './routes/products';
import recommendationRoutes from './routes/recommendations';
import userRoutes from './routes/users';
import swaggerSpecs from './swagger';

const envCandidates = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '.env.local'),
  path.resolve(__dirname, '..', '.env'),
];
const envPath = envCandidates.find(p => fs.existsSync(p));
dotenv.config(envPath ? { path: envPath } : undefined);

const app = express();
const PORT = process.env.PORT || 9300;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/explore-commerce';

export const getJwtSecret = () => process.env.JWT_SECRET || 'your_jwt_secret';
const jwtSecret = getJwtSecret();

const jwtAuth = expressjwt({
  secret: jwtSecret,
  algorithms: ['HS256'],
}).unless({
  path: [
    '/api/users/register',
    '/api/users/login',
    '/api/users/reset-password',
    '/health',
    /^\/api\/products.*/,
    /^\/api\/cart.*/,
    /^\/api\/recommendations.*/,
  ],
});

const rawCorsOrigins = process.env.CORS_ORIGINS;

const allowedOrigins =
  rawCorsOrigins && rawCorsOrigins !== '*'
    ? rawCorsOrigins.split(',').map(v => v.trim()).filter(Boolean)
    : [];

const corsOrigin =
  rawCorsOrigins === '*'
    ? true
    : allowedOrigins.length > 0
      ? allowedOrigins
      : process.env.NODE_ENV === 'production'
        ? false
        : true;

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'admin-secret'],
  })
);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_BODY_LIMIT || '10mb' }));
app.use(jwtAuth);
app.use((err: Error, req: any, res: any, next: any) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
  next(err);
});

app.get('/health', (_req: any, res: any) => {
  res.status(200).json({ status: 'ok', environment: process.env.NODE_ENV });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recommendations', recommendationRoutes);

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('Database connected');
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`API server running at http://0.0.0.0:${PORT}`);
    });

    process.on('SIGTERM', () => {
      server.close(() => {
        mongoose.connection
          .close()
          .then(() => {
            process.exit(0);
          })
          .catch(err => {
            console.error('Failed to close MongoDB connection:', err);
            process.exit(1);
          });
      });
    });
  })
  .catch(error => {
    console.error('Failed to connect database:', error);
  });

app.use((err: any, req: any, res: any, _next: any) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

export default app;
