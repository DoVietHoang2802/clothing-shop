# 📋 API TEST DOCUMENTATION - DEPLOYED

**Base URL:** `https://clothing-shop-api-8wae.onrender.com/api`

**Frontend:** `https://clothing-shop-ashy.vercel.app`

---

## 🔐 1. AUTHENTICATION - Xác thực

### 1.1 Đăng ký tài khoản
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "Nguyen Van A",
  "email": "usertest@gmail.com",
  "password": "Password123@"
}

✅ Test: Đăng ký thành công
❌ Lỗi: Email đã tồn tại
```

### 1.2 Đăng nhập
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "usertest@gmail.com",
  "password": "Password123@"
}

✅ Test: Đăng nhập thành công → nhận token JWT
❌ Lỗi: Sai mật khẩu / Email không tồn tại
```

### 1.3 Quên mật khẩu
```
POST /api/auth/forgot-password
Content-Type: application/json

Body:
{
  "email": "usertest@gmail.com"
}

✅ Test: Gửi email reset mật khẩu thành công
```

### 1.4 Đăng nhập Google (OAuth)
```
POST /api/auth/google
Content-Type: application/json

Body:
{
  "idToken": "google_id_token_here"
}

✅ Test: Đăng nhập/đăng ký bằng Google thành công
```

---

## 👤 2. USER - Người dùng

### 2.1 Lấy thông tin profile
```
GET /api/users/profile
Headers: Authorization: Bearer <token>

✅ Test: Lấy thông tin user hiện tại
```

### 2.2 Cập nhật profile
```
PUT /api/users/profile
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Nguyen Van B"
}

✅ Test: Cập nhật tên thành công
```

### 2.3 Đổi mật khẩu
```
PUT /api/users/change-password
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "currentPassword": "OldPassword123@",
  "newPassword": "NewPassword123@"
}

✅ Test: Đổi mật khẩu thành công
❌ Lỗi: Mật khẩu hiện tại không đúng
```

### 2.4 Upload avatar
```
POST /api/users/avatar
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- avatar: (chọn file ảnh)

✅ Test: Upload avatar thành công → nhận URL ảnh
```

---

## 📦 3. ADDRESS - Địa chỉ

### 3.1 Lấy danh sách địa chỉ
```
GET /api/addresses
Headers: Authorization: Bearer <token>

✅ Test: Lấy danh sách địa chỉ của user
```

### 3.2 Thêm địa chỉ mới
```
POST /api/addresses
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "fullName": "Nguyen Van A",
  "phone": "0123456789",
  "address": "123 Đường ABC",
  "city": "TPHCM",
  "district": "Quan 1",
  "ward": "Phường Bến Nghé",
  "isDefault": true
}

✅ Test: Thêm địa chỉ thành công
```

### 3.3 Cập nhật địa chỉ
```
PUT /api/addresses/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "fullName": "Nguyen Van B",
  "phone": "0987654321",
  "address": "456 Đường XYZ",
  "city": "Hanoi",
  "district": "Ba Đình",
  "ward": "Phường Liễu Giai",
  "isDefault": false
}

✅ Test: Cập nhật địa chỉ thành công
```

### 3.4 Xóa địa chỉ
```
DELETE /api/addresses/:id
Headers: Authorization: Bearer <token>

✅ Test: Xóa địa chỉ thành công
```

---

## 🏷️ 4. CATEGORY - Danh mục

### 4.1 Lấy danh sách danh mục
```
GET /api/categories

✅ Test: Lấy danh sách tất cả danh mục
```

### 4.2 Thêm danh mục (Admin)
```
POST /api/categories
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Áo Thun",
  "description": "Các loại áo thun nam nữ"
}

✅ Test: Thêm danh mục thành công (chỉ ADMIN/STAFF)
```

### 4.3 Cập nhật danh mục (Admin)
```
PUT /api/categories/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Áo Thun Nam",
  "description": "Áo thun dành cho nam giới"
}

✅ Test: Cập nhật danh mục thành công
```

### 4.4 Xóa danh mục (Admin)
```
DELETE /api/categories/:id
Headers: Authorization: Bearer <token>

✅ Test: Xóa danh mục thành công
```

---

## 👕 5. PRODUCT - Sản phẩm

### 5.1 Lấy danh sách sản phẩm
```
GET /api/products
Query params: ?limit=20&page=1&category=id

✅ Test: Lấy danh sách sản phẩm (phân trang)
```

### 5.2 Lấy chi tiết sản phẩm
```
GET /api/products/:id

✅ Test: Lấy thông tin chi tiết sản phẩm
```

### 5.3 Thêm sản phẩm (Admin)
```
POST /api/products
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Áo Thun Nam Cao Cấp",
  "description": "Áo thun nam chất lượng cao",
  "price": 299000,
  "stock": 50,
  "category": "category_id_here",
  "image": "https://example.com/image.jpg"
}

✅ Test: Thêm sản phẩm thành công
```

### 5.4 Upload hình ảnh sản phẩm
```
POST /api/products/upload
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- image: (chọn file ảnh JPG/PNG/GIF/WebP, tối đa 5MB)

✅ Test: Upload ảnh thành công → nhận URL ảnh
❌ Lỗi: File không đúng định dạng / Kích thước quá lớn
```

### 5.5 Cập nhật sản phẩm (Admin)
```
PUT /api/products/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Áo Thun Nam VIP",
  "price": 399000,
  "stock": 30
}

✅ Test: Cập nhật sản phẩm thành công
```

### 5.6 Xóa sản phẩm (Admin)
```
DELETE /api/products/:id
Headers: Authorization: Bearer <token>

✅ Test: Xóa sản phẩm thành công
```

---

## 🎫 6. COUPON - Mã giảm giá

### 6.1 Lấy danh sách coupon
```
GET /api/coupons

✅ Test: Lấy danh sách coupon còn hiệu lực
```

### 6.2 Tạo coupon (Admin)
```
POST /api/coupons
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "code": "SUMMER2026",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "minOrderValue": 100000,
  "maxDiscount": 50000,
  "usageLimit": 100,
  "expiresAt": "2026-12-31"
}

✅ Test: Tạo coupon giảm giá 20% thành công
```

### 6.3 Cập nhật coupon (Admin)
```
PUT /api/coupons/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "usageLimit": 200
}

✅ Test: Cập nhật coupon thành công
```

### 6.4 Xóa coupon (Admin)
```
DELETE /api/coupons/:id
Headers: Authorization: Bearer <token>

✅ Test: Xóa coupon thành công
```

---

## 📝 7. ORDER - Đơn hàng

### 7.1 Tạo đơn hàng COD
```
POST /api/orders
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "items": [
    { "productId": "product_id", "quantity": 2 }
  ],
  "couponCode": "SUMMER2026",
  "shippingAddress": {
    "fullName": "Nguyen Van A",
    "phone": "0123456789",
    "address": "123 Đường ABC, P.Bến Nghé, Q.1, TPHCM"
  },
  "paymentMethod": "COD"
}

✅ Test: Tạo đơn hàng COD thành công
- Stock sản phẩm tự động trừ
- Giảm stock khi tạo đơn
```

### 7.2 Tạo đơn hàng MoMo
```
POST /api/orders
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "items": [
    { "productId": "product_id", "quantity": 1 }
  ],
  "shippingAddress": {
    "fullName": "Nguyen Van A",
    "phone": "0123456789",
    "address": "123 Đường ABC, TPHCM"
  },
  "paymentMethod": "MOMO"
}

✅ Test: Tạo đơn hàng MoMo → nhận payUrl để redirect thanh toán
⚠️ Lưu ý: Stock CHƯA trừ, chỉ trừ khi thanh toán MoMo thành công
```

### 7.3 Lấy đơn hàng của tôi
```
GET /api/orders/my
Headers: Authorization: Bearer <token>

✅ Test: Lấy danh sách đơn hàng của user
- Đơn MoMo đang chờ thanh toán sẽ bị ẨN
```

### 7.4 Lấy chi tiết đơn hàng
```
GET /api/orders/:id
Headers: Authorization: Bearer <token>

✅ Test: Lấy thông tin chi tiết đơn hàng
```

### 7.5 Cập nhật trạng thái đơn hàng (Admin)
```
PUT /api/orders/:id/status
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "status": "CONFIRMED"
}

Các status hợp lệ:
- PENDING (Chờ xác nhận)
- CONFIRMED (Đã xác nhận)
- SHIPPED (Đã giao ĐVVC)
- DELIVERING (Đang giao)
- ARRIVED (Đã đến nơi)
- COMPLETED (Hoàn tất)
- CANCELLED (Đã hủy)

✅ Test: Cập nhật trạng thái thành công
- Khi COMPLETED: Hoàn stock
- Khi CANCELLED: Hoàn stock + xóa coupon usage
```

### 7.6 Xác nhận thanh toán cho shipper (COD)
```
POST /api/orders/:id/confirm-paid-shipper
Headers: Authorization: Bearer <token>

✅ Test: Xác nhận đã thanh toán cho shipper
```

### 7.7 Hủy đơn hàng
```
DELETE /api/orders/:id
Headers: Authorization: Bearer <token>

✅ Test: Hủy đơn hàng thành công
- Hoàn stock sản phẩm
```

### 7.8 Lấy tất cả đơn hàng (Admin)
```
GET /api/orders/all
Headers: Authorization: Bearer <token>

✅ Test: Lấy danh sách tất cả đơn hàng
```

---

## 💳 8. MOMO PAYMENT - Thanh toán MoMo

### 8.1 Tạo thanh toán MoMo
```
POST /api/momo/create
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "orderId": "order_id_here"
}

✅ Test: Tạo payment MoMo thành công → nhận payUrl
```

### 8.2 Callback từ MoMo (IPN)
```
POST /api/momo/ipn

MoMo sẽ gọi tự động khi:
- Thanh toán thành công (resultCode=0) → Cập nhật PAID + Trừ stock
- Hủy/thất bại (resultCode≠0) → Xóa đơn + Hoàn stock
```

### 8.3 Return URL sau thanh toán
```
GET /api/momo/return?resultCode=0&orderId=...

resultCode:
- 0: Thành công
- 1006: User hủy
- 1007: Timeout
```

### 8.4 Query trạng thái giao dịch
```
GET /api/momo/query/:orderId
Headers: Authorization: Bearer <token>

✅ Test: Kiểm tra trạng thái giao dịch MoMo
```

---

## ⭐ 9. REVIEW - Đánh giá

### 9.1 Thêm đánh giá sản phẩm
```
POST /api/reviews
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "product_id",
  "rating": 5,
  "comment": "Sản phẩm rất tốt, giao hàng nhanh!"
}

✅ Test: Thêm đánh giá thành công
```

### 9.2 Lấy đánh giá theo sản phẩm
```
GET /api/reviews/product/:productId

✅ Test: Lấy danh sách đánh giá của sản phẩm
```

### 9.3 Xóa đánh giá
```
DELETE /api/reviews/:id
Headers: Authorization: Bearer <token>

✅ Test: Xóa đánh giá thành công
```

---

## ❤️ 10. WISHLIST - Yêu thích

### 10.1 Lấy danh sách yêu thích
```
GET /api/wishlist
Headers: Authorization: Bearer <token>

✅ Test: Lấy danh sách sản phẩm yêu thích
```

### 10.2 Thêm vào yêu thích
```
POST /api/wishlist
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "product_id"
}

✅ Test: Thêm sản phẩm vào yêu thích
```

### 10.3 Xóa khỏi yêu thích
```
DELETE /api/wishlist/:productId
Headers: Authorization: Bearer <token>

✅ Test: Xóa sản phẩm khỏi yêu thích
```

---

## 💬 11. CHAT - Nhắn tin

### 11.1 Lấy danh sách cuộc trò chuyện
```
GET /api/chat/conversations
Headers: Authorization: Bearer <token>

✅ Test: Lấy danh sách cuộc trò chuyện
```

### 11.2 Lấy tin nhắn trong cuộc trò chuyện
```
GET /api/chat/conversations/:conversationId/messages
Headers: Authorization: Bearer <token>

✅ Test: Lấy tin nhắn trong cuộc trò chuyện
```

### 11.3 Gửi tin nhắn
```
POST /api/chat/messages
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "conversationId": "conversation_id",
  "content": "Xin chào, tôi cần hỗ trợ!"
}

✅ Test: Gửi tin nhắn thành công
```

### 11.4 Tạo cuộc trò chuyện mới
```
POST /api/chat/conversations
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "participantId": "user_id"
}

✅ Test: Tạo cuộc trò chuyện mới với user khác
```

---

## 🔔 12. NOTIFICATION - Thông báo

### 12.1 Lấy danh sách thông báo
```
GET /api/notifications?limit=20
Headers: Authorization: Bearer <token>

✅ Test: Lấy danh sách thông báo
```

### 12.2 Lấy số thông báo chưa đọc
```
GET /api/notifications/unread-count
Headers: Authorization: Bearer <token>

✅ Test: Lấy số thông báo chưa đọc
```

### 12.3 Đánh dấu đã đọc
```
PUT /api/notifications/:id/read
Headers: Authorization: Bearer <token>

✅ Test: Đánh dấu thông báo đã đọc
```

### 12.4 Đánh dấu đã đọc tất cả
```
PUT /api/notifications/read-all
Headers: Authorization: Bearer <token>

✅ Test: Đánh dấu tất cả thông báo đã đọc
```

### 12.5 Xóa thông báo
```
DELETE /api/notifications/:id
Headers: Authorization: Bearer <token>

✅ Test: Xóa thông báo thành công
```

---

## 🔌 13. SSE - Real-time (Server-Sent Events)

### 13.1 Kết nối SSE cho orders
```
GET /api/orders/sse
Headers: Authorization: Bearer <token>

Event types:
- connected: Kết nối thành công
- NEW_ORDER: Có đơn hàng mới (Admin)
- ORDER_STATUS_CHANGED: Trạng thái đơn thay đổi
- new_notification: Có thông báo mới

✅ Test: Kết nối SSE thành công, nhận real-time events
```

---

## 📊 14. ADMIN DASHBOARD

### 14.1 Thống kê dashboard
```
GET /api/admin/dashboard
Headers: Authorization: Bearer <token>

✅ Test: Lấy thống kê tổng quan
- Tổng số users
- Tổng số đơn hàng
- Tổng doanh thu
- Sản phẩm bán chạy
```

### 14.2 Lấy danh sách users (Admin)
```
GET /api/admin/users
Headers: Authorization: Bearer <token>

✅ Test: Lấy danh sách tất cả users
```

### 14.3 Cập nhật role user (Admin)
```
PUT /api/admin/users/:id/role
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "role": "STAFF"
}

Các role: USER, STAFF, ADMIN

✅ Test: Cập nhật role thành công
```

---

## 🔑 ROLE PERMISSIONS - Phân quyền

| Role | Quyền |
|------|--------|
| USER | Xem sản phẩm, mua hàng, quản lý đơn, chat |
| STAFF | USER + CRUD sản phẩm, quản lý đơn hàng |
| ADMIN | Full access |

---

## 🚨 ERROR CODES - Mã lỗi

| Status | Message | Nguyên nhân |
|--------|---------|-------------|
| 400 | Vui lòng cung cấp tên, giá và danh mục | Thiếu field bắt buộc |
| 401 | Không có quyền truy cập | Token hết hạn / Sai token |
| 403 | Bạn không có quyền | Không đủ quyền thực hiện |
| 404 | Không tìm thấy | Resource không tồn tại |
| 500 | Lỗi máy chủ nội bộ | Lỗi server |

---

## 📱 PAYMENT FLOW - Luồng thanh toán

### COD Flow:
```
Tạo đơn → Trừ stock → Giao hàng → Thanh toán COD → COMPLETED
```

### MoMo Flow:
```
Tạo đơn (stock giữ nguyên) → Redirect MoMo
    ↓
Thành công → Trừ stock → Cập nhật PAID → COMPLETED
    ↓
Hủy/Thất bại → Xóa đơn → Stock giữ nguyên
```

---

**© 2026 - Clothing Shop API Documentation**
