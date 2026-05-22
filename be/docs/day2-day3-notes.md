# Day 2-3 Notes: Warehouse Delivery Module

## Day 2 implemented

- Stock core logic:
  - `POST /api/warehouse/stock-in`
  - `POST /api/warehouse/stock-out`
  - `POST /api/warehouse/stock-return`
- Inventory/report endpoints:
  - `GET /api/warehouse/inventory`
  - `GET /api/warehouse/low-stock`
  - `GET /api/warehouse/order-status-summary`
- Movement log is tracked in memory (`data/store.js`) as a placeholder before DB integration.

## Day 3 implemented

- Delivery status endpoint:
  - `PUT /api/orders/:id/status`
- Transition rules:
  - `processing -> shipped|failed`
  - `shipped -> delivered|failed`
- Inventory side effects:
  - on `shipped`: stock-out for order items
  - on `failed` (after stock applied): stock-return for order items
- Invalid transitions return `409 INVALID_STATUS_TRANSITION`.

## Redis (leader request)

- Added Redis client bootstrap in `config/redisClient.js`.
- Uses optional `REDIS_URL`; service still works if Redis is unavailable.
- Cached order status summary for 60 seconds.

## Security (leader request)

- Added `helmet` to set secure HTTP headers.
- Added global rate limiting via `express-rate-limit`.
- Added `dotenv` and disabled `x-powered-by`.

## Day 4+ implemented

- MongoDB models: `product`, `order`, `warehouseMovement` (+ `role`, `user`, `category` for auth/seed).
- Services refactored to Mongoose; order status updates use DB transactions.
- RBAC: `checkLogin` + `checkRole(['Admin', 'Manager', 'Warehouse'])` on warehouse/order routes.
- Auth: `POST /api/auth/login` for JWT (test account: `warehouse@holagroup.com` / `Warehouse123`).
- Seed: `npm run seed:warehouse`
- Tests: `npm test` (order transition matrix).

## Env

Copy `be/.env.example` to `be/.env` and set `DB_URI`, `JWT_SECRET`.

