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

## Next step (Day 4+)

- Replace in-memory store with Mongo repository layer.
- Add RBAC middleware and JWT auth integration.
- Add automated tests for transition matrix and stock conflicts.

