# Shopping API

Backend API service for the shopping system. Provides endpoints for products, users, carts, and orders.

## Tech stack

- Express.js
- MongoDB / Mongoose
- TypeScript

## Install and run

Install dependencies:

```bash
pnpm install
```

Run in development:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Start the bundled handler:

```bash
pnpm start
```

## Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required variables:

- `PORT`: server port
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret
- `CORS_ORIGINS`: allowed origins
- `ADMIN_SECRET`: admin secret used for product write operations

Example:

```env
MONGODB_URI=mongodb://localhost:27017/shopping-system
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
ADMIN_SECRET=your_admin_secret_here
```

## API endpoints

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Users

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/:id`
- `PUT /api/users/:id`

### Cart

- `GET /api/cart/:userId`
- `POST /api/cart/:userId`
- `PUT /api/cart/:userId/item/:productId`
- `DELETE /api/cart/:userId/item/:productId`
- `DELETE /api/cart/:userId`

### Orders

- `POST /api/orders/:userId`
- `GET /api/orders/user/:userId`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/status`

## Admin usage

For product create/update/delete requests, add the `admin-secret` header with the value of `ADMIN_SECRET`.

Example:

```bash
curl -X POST "http://localhost:3001/api/products" \
  -H "Content-Type: application/json" \
  -H "admin-secret: your_admin_secret_here" \
  -d '{"name":"Example","price":99.99,"description":"Example"}'
```
