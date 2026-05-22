# Backend — Module Kho hàng & Vận chuyển (Warehouse)

Express + MongoDB + JWT. Nhánh: `feat/minhnhieu/warehouse-delivery`.

**Base URL (mặc định):** `http://localhost:3000`

---

## 1. Công nghệ

| Thành phần | Gói / Ghi chú |
|------------|----------------|
| Runtime | Node.js (CommonJS) |
| Framework | Express 5 |
| Database | MongoDB (Mongoose) |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Cache (tùy chọn) | Redis (`REDIS_URL`) |
| Bảo mật | helmet, express-rate-limit, CORS |

---

## 2. Cấu trúc thư mục

```
be/
├── src/index.js              # Entry: middleware, mount routes, start server
├── config/
│   ├── database.js           # Kết nối MongoDB
│   └── redisClient.js        # Redis (optional)
├── routes/
│   ├── authRoute.js          # POST /api/auth/login
│   ├── warehouseRoute.js     # /api/warehouse/*
│   └── orderRoute.js         # /api/orders/*
├── controllers/              # Nhận req/res, gọi service
├── services/                 # Logic nghiệp vụ
├── schemas/                  # Mongoose models
├── middlewares/authHandler.js  # checkLogin, checkRole
├── constants/warehouseRoles.js
├── utils/                    # HttpError, serializers, orderTransitions, mongoTransaction
├── scripts/seedWarehouse.js  # Dữ liệu mẫu
├── tests/orderTransitions.test.js
├── .env.example
└── package.json
```

---

## 3. Chạy dự án

### Yêu cầu

- Node.js 18+
- MongoDB chạy tại `mongodb://127.0.0.1:27017` (hoặc chỉnh `DB_URI`)

### Cài đặt & chạy

```bash
cd srs/be
npm install
copy .env.example .env    # Windows
# chỉnh DB_URI, JWT_SECRET nếu cần

npm run seed:warehouse    # seed demo đơn giản (tùy chọn)
npm run migrate:sql:clear # migrate từ srs.sql schema + be/data/srs-seed-data.sql
npm run dev               # hoặc: npm start
```

Server log: `Backend server is running on port 3000`

### Script khác

```bash
npm test                  # unit test ma trận chuyển trạng thái đơn
npm run seed:warehouse    # seed lại dữ liệu warehouse
```

---

## 4. Biến môi trường (`.env`)

| Biến | Mặc định | Mô tả |
|------|----------|--------|
| `PORT` | `3000` | Port HTTP |
| `DB_URI` | `mongodb://127.0.0.1:27017/srs_db` | MongoDB connection string |
| `JWT_SECRET` | *(bắt buộc trong `.env`)* | Khóa ký JWT — xem `be/.env.example`, **không commit** `.env` |
| `JWT_EXPIRES_IN` | `1d` | Thời hạn access token (`jsonwebtoken` expiresIn) |
| `CORS_ORIGIN` | `http://localhost:5173` | Origin FE được phép |
| `REDIS_URL` | (trống) | Bật cache summary nếu có Redis |
| `MONGO_USE_TRANSACTIONS` | (không set) | Đặt `true` khi MongoDB là replica set |
| `RATE_LIMIT_MAX` | `300` | Giới hạn request / cửa sổ |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Cửa sổ rate limit (ms) |

---

## 5. Xác thực (JWT)

Mọi API **warehouse** và **orders** đều cần header:

```
Authorization: Bearer <accessToken>
```

### Đăng nhập

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "warehouse@holagroup.com",
  "password": "Warehouse123"
}
```

**Response 200:**

```json
{
  "code": "SUCCESS",
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Tài khoản seed

| Email | Password | Role |
|-------|----------|------|
| `warehouse@holagroup.com` | `Warehouse123` | Warehouse |
| `admin@holagroup.com` | `AdminPassword123` | Admin |

### Role được phép gọi API kho

`Admin`, `Manager`, `Warehouse`

---

## 6. Danh sách API

### Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | Không |

```json
{
  "code": "SUCCESS",
  "message": "Backend is running",
  "module": "warehouse-delivery",
  "timestamp": 1710000000000
}
```

---

### Kho — `/api/warehouse`

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/stock-in` | Nhập kho |
| POST | `/stock-out` | Xuất kho |
| POST | `/stock-return` | Hoàn kho |
| GET | `/inventory` | Báo cáo tồn kho |
| GET | `/low-stock` | Sản phẩm sắp hết |
| GET | `/order-status-summary` | Thống kê trạng thái đơn |
| GET | `/movements` | Lịch sử xuất/nhập |

#### POST `/api/warehouse/stock-in`

```json
{
  "productId": "6a081307eaf96aea0e4aa90f",
  "quantity": 10,
  "reason": "Nhập hàng đợt 1"
}
```

`userId` tự gắn từ JWT (không cần gửi).

#### POST `/api/warehouse/stock-out`

```json
{
  "productId": "6a081307eaf96aea0e4aa90f",
  "quantity": 2,
  "reason": "Xuất thủ công"
}
```

#### POST `/api/warehouse/stock-return`

```json
{
  "productId": "6a081307eaf96aea0e4aa90f",
  "quantity": 2,
  "orderId": "optional-order-id",
  "reason": "Hoàn do giao thất bại"
}
```

#### GET `/api/warehouse/inventory`

Query: `?q=cable&status=active`

#### GET `/api/warehouse/low-stock`

Query: `?threshold=10`

#### GET `/api/warehouse/movements`

Query: `?productId=...&orderId=...&type=stock_in|stock_out|stock_return`

---

### Đơn hàng (giao hàng) — `/api/orders`

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/` | Danh sách đơn |
| GET | `/:id` | Chi tiết đơn |
| PUT | `/:id/status` | Cập nhật trạng thái giao |

#### PUT `/api/orders/:id/status`

```json
{
  "status": "shipped",
  "failureReason": null
}
```

**Giá trị `status`:** `processing` | `shipped` | `delivered` | `failed`

**Ma trận chuyển trạng thái:**

```
processing → shipped | failed
shipped    → delivered | failed
delivered  → (không chuyển tiếp)
failed     → (không chuyển tiếp)
```

**Tác động tồn kho:**

- `shipped` (lần đầu): tự động **stock-out** theo từng dòng trong đơn
- `failed` (sau khi đã trừ kho): tự động **stock-return**

Lỗi chuyển trạng thái sai: `409` — `INVALID_STATUS_TRANSITION`  
Không đủ tồn: `409` — `INSUFFICIENT_STOCK`

---

## 7. Format response & lỗi

### Thành công (ví dụ)

```json
{
  "code": "SUCCESS",
  "message": "Lấy tồn kho thành công",
  "data": []
}
```

### Lỗi (ví dụ)

```json
{
  "code": "UNAUTHORIZED",
  "message": "Vui lòng đăng nhập (thiếu token)."
}
```

| HTTP | code (ví dụ) | Ý nghĩa |
|------|----------------|---------|
| 400 | `BAD_REQUEST` | Thiếu/sai dữ liệu |
| 401 | `UNAUTHORIZED` / `TOKEN_INVALID` | Chưa login / token hỏng |
| 403 | `FORBIDDEN` | Sai role |
| 404 | `NOT_FOUND` | Không tìm thấy product/order |
| 409 | `INVALID_STATUS_TRANSITION` / `INSUFFICIENT_STOCK` | Conflict nghiệp vụ |
| 500 | `SERVER_ERROR` | Lỗi server |

---

## 8. Models MongoDB (tóm tắt)

| Collection | Model file | Ghi chú |
|------------|------------|---------|
| `products` | `schemas/product.js` | `stockQuantity`, `status` |
| `orders` | `schemas/order.js` | `items[]`, `status`, `inventoryApplied` |
| `warehousemovements` | `schemas/warehouseMovement.js` | `stock_in` / `stock_out` / `stock_return` |
| `users`, `roles` | `schemas/user.js`, `role.js` | Auth |
| `categories` | `schemas/category.js` | Phục vụ seed product |

`productId` / `orderId` trong API là **MongoDB ObjectId** (chuỗi 24 ký tự hex).

---

## 9. Luồng test nhanh (curl / Postman)

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"warehouse@holagroup.com\",\"password\":\"Warehouse123\"}"

# 2. Lấy token từ response → TOKEN

# 3. Tồn kho
curl http://localhost:3000/api/warehouse/inventory ^
  -H "Authorization: Bearer TOKEN"

# 4. Danh sách đơn
curl http://localhost:3000/api/orders ^
  -H "Authorization: Bearer TOKEN"
```

---

## 10. Ghi chú triển khai

- **FE** mặc định: `http://localhost:5173` — cần chạy `npm run dev` trong `srs/fe` riêng.
- API warehouse **bắt buộc JWT**; gọi trực tiếp từ trình duyệt không token → `401`.
- Redis: tùy chọn; không có `REDIS_URL` vẫn chạy bình thường.
- Transaction MongoDB: mặc định **tắt** trên standalone; production replica set → `MONGO_USE_TRANSACTIONS=true`.

Chi tiết Day 2–3: `docs/day2-day3-notes.md`.
