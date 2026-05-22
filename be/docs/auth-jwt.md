# Auth / JWT — Warehouse Backend

## JWT_SECRET lưu ở đâu?

| Môi trường | Vị trí |
|------------|--------|
| Local dev | File `be/.env` (không commit git — nằm trong `.gitignore`) |
| Mẫu cho team | `be/.env.example` → `JWT_SECRET=change_me_in_production` |
| Bắt buộc | Không có fallback — thiếu hoặc vẫn là `change_me_in_production` thì API auth báo lỗi (`config/jwtSecret.js`) |

**Lưu ý:** `JWT_SECRET` **không** hash/bcrypt như mật khẩu user. Đây là khóa đối xứng để **ký** JWT (`jsonwebtoken`); server phải đọc được giá trị gốc từ `.env`. Giá trị trong `.env` nên là chuỗi ngẫu nhiên dài (ví dụ `crypto.randomBytes(48).toString('base64url')`).

**Production:** mỗi môi trường set `JWT_SECRET` riêng trên server/CI (Azure, Docker env, v.v.).

## Payload trong JWT (access token)

Khi login (`POST /api/auth/login`), token được ký với payload:

```json
{
  "id": "<MongoDB ObjectId của User>",
  "email": "warehouse@holagroup.com",
  "iat": 1234567890,
  "exp": 1234654290
}
```

| Field | Có trong JWT? | Ghi chú |
|-------|---------------|---------|
| `id` (userId) | **Có** | `_id` user trong MongoDB |
| `email` | **Có** | Email đăng nhập |
| `roleID` | **Không** | Lấy từ DB khi verify (`populate roleID`) |
| `roleName` | **Không** | Lấy qua `GET /api/auth/me` hoặc `checkRole` middleware |

**Lý do không nhét role vào JWT:** đổi quyền trên DB có hiệu lực ngay, không cần login lại; tránh token cũ mang role sai.

## Luồng sau login

1. `POST /api/auth/login` → `{ accessToken }`
2. Client gửi `Authorization: Bearer <token>`
3. `checkLogin`: verify JWT → `User.findById(decoded.id).populate('roleID')`
4. `checkRole(['Admin','Manager','Warehouse'])` trên route kho/đơn
5. `GET /api/auth/me` → trả profile (không có password)

## File liên quan

- `services/authService.js` — login, ký JWT
- `controllers/authController.js` — login, me
- `routes/authRoute.js`
- `middlewares/authHandler.js` — verify + RBAC
- `schemas/user.js`, `schemas/role.js`

## Thời hạn token

`JWT_EXPIRES_IN` trong `be/.env` (mặc định `1d`) — đọc qua `getJwtExpiresIn()` khi `jwt.sign` trong `authService.js`.

## Chưa có (phase sau)

- `POST /api/auth/logout` + Redis blacklist
- Refresh token
