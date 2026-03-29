# ✅ API TEST PROGRESS (Deployed)

**Mục tiêu:** Ghi rõ API đã test, chưa test, pass/fail và chỗ lệch giữa tài liệu với API thực tế.
**Không chỉnh file:** `BAO_CAO_API.md`

- **Backend test:** `https://clothing-shop-api-8wae.onrender.com/api`
- **Admin account:** `admin3@gmail.com`
- **User test tạo mới:** `apitest_1774766394@mail.com`
- **Script dùng:** `tmp_api_full_test.py`
- **Raw result:** `api_test_result.json`

---

## 1) Tổng quan kết quả lần chạy gần nhất

- **Tổng API đã chạy:** 23
- **Pass (theo kịch bản):** 23
- **Fail:** 0

> Lưu ý: Có endpoint trả `404` nhưng vẫn được script đánh dấu `ok=True` vì tiêu chí lúc đó là “không lỗi 5xx”. Mục 3 bên dưới đã tách riêng các **điểm lệch cần sửa tài liệu/kịch bản**.

---

## 2) Danh sách API đã test

1. `POST /auth/login` — Admin login ✅
2. `POST /auth/register` — User register ✅
3. `GET /health` ✅
4. `GET /categories` ✅
5. `GET /products` ✅
6. `POST /categories` (admin) ✅
7. `POST /products` (admin) ✅
8. `POST /coupons` (admin) ✅
9. `GET /orders` (admin list orders) ✅
10. `GET /admin/users` ⚠️ (404 — lệch tài liệu/kịch bản, xem mục 3)
11. `GET /users/profile` (user) ✅
12. `GET /addresses` (user) ✅
13. `GET /wishlist` (user) ✅
14. `GET /notifications` (user) ✅
15. `GET /notifications/unread-count` (user) ✅
16. `POST /addresses` (user) ✅
17. `POST /orders` (user, COD) ✅
18. `POST /momo/create` (user) ✅
19. `POST /reviews` (user) ✅
20. `GET /reviews/product/:productId` ✅
21. `PUT /orders/:id/status` -> `CONFIRMED` (admin) ✅
22. `PUT /orders/:id/status` -> `SHIPPED` (admin) ✅
23. `POST /categories` bằng token user -> **403** (permission test) ✅

---

## 3) Điểm lệch phát hiện được (cần cập nhật tài liệu/kịch bản)

### 3.1 Admin users endpoint
- **Trong tài liệu hiện tại:** `GET /api/admin/users`
- **Kết quả test thực tế:** `404 Not Found`
- **Nguyên nhân:** Route thực tế quản lý users đang nằm ở nhóm `/api/users` (có authorize ADMIN), không phải `/api/admin/users`.

**Đề xuất đúng theo code route hiện tại:**
- `GET /api/users` (ADMIN)
- `PUT /api/users/:id/role` (ADMIN)
- `DELETE /api/users/:id` (ADMIN)

### 3.2 Admin dashboard endpoint
- **Trong tài liệu hiện tại:** `GET /api/admin/dashboard`
- **Trong code route admin hiện tại:**
  - `GET /api/admin/stats`
  - `GET /api/admin/stats/chart`

**Đề xuất:** Đồng bộ tài liệu theo route thực tế.

---

## 4) API CHƯA TEST (theo phạm vi đầy đủ trong BAO_CAO_API.md)

### 4.1 Auth/User
- `POST /auth/google`
- `POST /auth/forgot-password`
- `POST /auth/refresh-token`
- `POST /auth/change-password`
- `POST /auth/reset-password/:token`
- `PUT /users/profile`
- `POST /users/avatar`

### 4.2 Address
- `GET /addresses/:id`
- `PUT /addresses/:id`
- `DELETE /addresses/:id`
- `PUT /addresses/:id/default`

### 4.3 Category/Product/Coupon (full CRUD chưa đủ)
- Category: `PUT /categories/:id`, `DELETE /categories/:id`
- Product: `GET /products/:id`, `POST /products/upload`, `PUT /products/:id`, `DELETE /products/:id`
- Coupon: `GET /coupons` (admin version), `GET /coupons/:id`, `PUT /coupons/:id`, `DELETE /coupons/:id`, `POST /coupons/validate`

### 4.4 Orders
- `GET /orders/my` (đã test gián tiếp tạo đơn, nhưng chưa gọi explicit trong script mới)
- `GET /orders/:id`
- `PUT /orders/:id/paid-to-shipper`
- `PUT /orders/:id/cancel`
- `DELETE /orders/:id`
- `DELETE /orders/admin/:id`
- `GET /orders/sse` (chưa test stream thực)

### 4.5 MoMo
- `POST /momo/ipn` (callback giả lập chưa test)
- `GET /momo/return` (redirect callback chưa test)
- `GET /momo/query/:orderId`

### 4.6 Review/Wishlist
- Review: `GET /reviews/product/:productId/average`, `PUT /reviews/:id`, `DELETE /reviews/:id`
- Wishlist: `GET /wishlist/check/:productId`, `DELETE /wishlist/:productId`

### 4.7 Chat
- `GET /chat/sse`
- `POST /chat/send`
- `GET /chat/conversations/all`
- `GET /chat/users/list`
- `GET /chat/:userId`
- `PUT /chat/read/:userId`
- `GET /chat/unread/count`
- `DELETE /chat/message/:id`
- `DELETE /chat/conversation/:userId`

### 4.8 Notifications
- `PUT /notifications/read-all`
- `DELETE /notifications/read`
- `GET /notifications/:id`
- `PUT /notifications/:id/read`
- `DELETE /notifications/:id`

### 4.9 Mock payment routes (nếu còn dùng)
- `POST /payment/vnpay/create`
- `POST /payment/mock/confirm`
- `POST /payment/mock/cancel`

---

## 5) Checklist chụp màn hình Postman (chụp ngay)

### Nhóm chắc chắn chụp được ngay (đã test pass)
- [ ] `POST /auth/login` (admin)
- [ ] `POST /auth/register` (user test)
- [ ] `GET /categories`
- [ ] `GET /products`
- [ ] `POST /categories` (admin)
- [ ] `POST /products` (admin)
- [ ] `POST /coupons` (admin)
- [ ] `GET /orders` (admin)
- [ ] `GET /users/profile` (user)
- [ ] `POST /addresses` (user)
- [ ] `POST /orders` (user, COD)
- [ ] `POST /momo/create` (user)
- [ ] `POST /reviews` (user)
- [ ] `PUT /orders/:id/status` (admin)
- [ ] Permission test: `POST /categories` bằng user token -> 403

### Nhóm cần chạy bổ sung trước khi chụp
- [ ] Toàn bộ endpoint mục 4 (chưa test)

---

## 6) Gợi ý bước tiếp theo (nhẹ token)

1. Ưu tiên test bổ sung các endpoint **được ghi trong BAO_CAO_API.md** nhưng chưa chạy (mục 4).
2. Cập nhật `BAO_CAO_API.md` theo 2 lệch lớn:
   - `/api/admin/users` -> route thực tế `/api/users` (admin)
   - `/api/admin/dashboard` -> route thực tế `/api/admin/stats`
3. Sau đó mới chụp Postman full bộ.

---

**Generated:** 2026-03-29
