# 📘 BÁO CÁO API - CLOTHING SHOP

**Dự án:** Website Thương mại điện tử Clothing Shop
**Ngày nộp:** 08/04/2026
**GVHD:** [Tên thầy/cô]
**SVTH:** [Họ tên - MSSV]

---

## 1. TỔNG QUAN

### 1.1 Giới thiệu
- **Tên dự án:** Clothing Shop
- **Loại:** Website Thương mại điện tử bán quần áo
- **Base URL:** `https://clothing-shop-api-8wae.onrender.com/api`
- **Frontend:** `https://clothing-shop-ashy.vercel.app`

### 1.2 Công nghệ sử dụng

| Layer | Công nghệ |
|-------|------------|
| Frontend | React.js, Vite, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT, Firebase Google OAuth |
| Payment | MoMo UAT (Test Payment) |
| Image Upload | Cloudinary |
| Real-time | SSE (Server-Sent Events) |
| Deploy | Vercel (Frontend), Render (Backend) |

### 1.3 Sơ đồ kiến trúc
```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Client    │────▶│   API Server    │────▶│  MongoDB   │
│  (React)    │◀────│   (Express)     │◀────│            │
└─────────────┘     └─────────────────┘     └─────────────┘
       │                    │
       │                    ▼
       │             ┌─────────────┐
       │             │ Cloudinary │
       │             │  (Image)   │
       │             └─────────────┘
       ▼
┌─────────────┐
│    MoMo     │
│  (Payment) │
└─────────────┘
```

---

## 2. DATABASE MODELS

Dự án có **10 models** (yêu cầu 8 models):

| # | Model | Mô tả |
|---|-------|--------|
| 1 | User | Người dùng (role: USER, STAFF, ADMIN) |
| 2 | Product | Sản phẩm |
| 3 | Category | Danh mục sản phẩm |
| 4 | Order | Đơn hàng |
| 5 | Coupon | Mã giảm giá |
| 6 | Review | Đánh giá sản phẩm |
| 7 | Wishlist | Sản phẩm yêu thích |
| 8 | Address | Địa chỉ giao hàng |
| 9 | Message | Tin nhắn chat |
| 10 | Notification | Thông báo |

---

## 3. AUTHENTICATION & AUTHORIZATION

### 3.1 Authentication
Hệ thống sử dụng **JWT Token** để xác thực người dùng.

**Header:** `Authorization: Bearer <token>`

### 3.2 Authorization - Phân quyền

| Role | Mô tả | Quyền |
|------|--------|--------|
| USER | Khách hàng | Mua hàng, xem đơn, chat |
| STAFF | Nhân viên | CRUD sản phẩm, quản lý đơn |
| ADMIN | Quản trị | Full access |

### 3.3 Cách test với tài khoản Admin
```
1. Đăng nhập bằng tài khoản có role = ADMIN
2. Token nhận được chứa thông tin role
3. Các API Admin sẽ hoạt động khi role = ADMIN
```

---

## 4. HƯỚNG DẪN TEST API VỚI POSTMAN

### ⚠️ LƯU Ý QUAN TRỌNG
- **(ADMIN):** Cần đăng nhập tài khoản có role = ADMIN
- **(USER):** Cần đăng nhập tài khoản thường
- **(Công khai):** Không cần token

---

## 5. API ENDPOINTS

---

### 5.1 AUTH - Xác thực

#### Đăng ký tài khoản (Công khai)
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "Nguyen Van A",
  "email": "usertest@gmail.com",
  "password": "Password123@"
}

Response (201):
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI..."
  }
}
```

#### Đăng nhập (Công khai)
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "usertest@gmail.com",
  "password": "Password123@"
}

Response (200):
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI..."
  }
}
```

#### Đăng nhập Google OAuth (Công khai)
```
POST /api/auth/google
Content-Type: application/json

Body:
{
  "idToken": "google_id_token_here"
}
```

#### Quên mật khẩu (Công khai)
```
POST /api/auth/forgot-password
Content-Type: application/json

Body:
{
  "email": "usertest@gmail.com"
}
```

---

### 5.2 USER - Người dùng (USER)

#### Lấy thông tin profile
```
GET /api/users/profile
Headers: Authorization: Bearer <token>
```

#### Cập nhật profile
```
PUT /api/users/profile
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Nguyen Van B"
}
```

#### Đổi mật khẩu
```
PUT /api/users/change-password
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "currentPassword": "OldPassword123@",
  "newPassword": "NewPassword123@"
}
```

#### Upload avatar
```
POST /api/users/avatar
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- avatar: (file ảnh)
```

---

### 5.3 ADDRESS - Địa chỉ (USER)

#### Lấy danh sách địa chỉ
```
GET /api/addresses
Headers: Authorization: Bearer <token>
```

#### Thêm địa chỉ mới
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
```

#### Cập nhật địa chỉ
```
PUT /api/addresses/:id
Headers: Authorization: Bearer <token>
```

#### Xóa địa chỉ
```
DELETE /api/addresses/:id
Headers: Authorization: Bearer <token>
```

---

### 5.4 CATEGORY - Danh mục

#### Lấy danh sách danh mục (Công khai)
```
GET /api/categories
```

#### Thêm danh mục (ADMIN)
```
POST /api/categories
Headers: Authorization: Bearer <token> (ADMIN)
Content-Type: application/json

Body:
{
  "name": "Áo Thun",
  "description": "Các loại áo thun"
}
```

#### Cập nhật danh mục (ADMIN)
```
PUT /api/categories/:id
Headers: Authorization: Bearer <token> (ADMIN)
```

#### Xóa danh mục (ADMIN)
```
DELETE /api/categories/:id
Headers: Authorization: Bearer <token> (ADMIN)
```

---

### 5.5 PRODUCT - Sản phẩm

#### Lấy danh sách sản phẩm (Công khai)
```
GET /api/products
Query params: ?limit=20&page=1&category=id
```

#### Lấy chi tiết sản phẩm (Công khai)
```
GET /api/products/:id
```

#### Thêm sản phẩm (ADMIN)
```
POST /api/products
Headers: Authorization: Bearer <token> (ADMIN)
Content-Type: application/json

Body:
{
  "name": "Áo Thun Nam Cao Cấp",
  "description": "Áo thun chất lượng cao",
  "price": 299000,
  "stock": 50,
  "category": "category_id",
  "image": "https://example.com/image.jpg"
}
```

#### Upload hình ảnh sản phẩm (ADMIN)
```
POST /api/products/upload
Headers: Authorization: Bearer <token> (ADMIN)
Content-Type: multipart/form-data

Form Data:
- image: (file ảnh JPG/PNG/GIF/WebP, tối đa 5MB)
```

#### Cập nhật sản phẩm (ADMIN)
```
PUT /api/products/:id
Headers: Authorization: Bearer <token> (ADMIN)
```

#### Xóa sản phẩm (ADMIN)
```
DELETE /api/products/:id
Headers: Authorization: Bearer <token> (ADMIN)
```

---

### 5.6 COUPON - Mã giảm giá

#### Lấy danh sách coupon (Công khai)
```
GET /api/coupons
```

#### Tạo coupon (ADMIN)
```
POST /api/coupons
Headers: Authorization: Bearer <token> (ADMIN)
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

discountType: PERCENTAGE | FIXED
```

#### Cập nhật coupon (ADMIN)
```
PUT /api/coupons/:id
Headers: Authorization: Bearer <token> (ADMIN)
```

#### Xóa coupon (ADMIN)
```
DELETE /api/coupons/:id
Headers: Authorization: Bearer <token> (ADMIN)
```

---

### 5.7 ORDER - Đơn hàng

#### Tạo đơn hàng (USER)
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
    "address": "123 Đường ABC, TPHCM"
  },
  "paymentMethod": "COD"
}

paymentMethod: COD | MOMO
```

#### Lấy đơn hàng của tôi (USER)
```
GET /api/orders/my
Headers: Authorization: Bearer <token>
```

#### Lấy chi tiết đơn hàng (USER)
```
GET /api/orders/:id
Headers: Authorization: Bearer <token>
```

#### Lấy tất cả đơn hàng (ADMIN)
```
GET /api/orders/all
Headers: Authorization: Bearer <token> (ADMIN)
```

#### Cập nhật trạng thái đơn hàng (ADMIN)
```
PUT /api/orders/:id/status
Headers: Authorization: Bearer <token> (ADMIN)
Content-Type: application/json

Body:
{
  "status": "CONFIRMED"
}

Các trạng thái:
- PENDING: Chờ xác nhận
- CONFIRMED: Đã xác nhận
- SHIPPED: Đã giao ĐVVC
- DELIVERING: Đang giao
- ARRIVED: Đã đến nơi
- PAID_TO_SHIPPER: Đã thanh toán cho shipper
- COMPLETED: Hoàn tất
- CANCELLED: Đã hủy
```

#### Xác nhận thanh toán cho shipper (USER - COD)
```
POST /api/orders/:id/confirm-paid-shipper
Headers: Authorization: Bearer <token>
```

#### Hủy đơn hàng (USER)
```
DELETE /api/orders/:id
Headers: Authorization: Bearer <token>
```

---

### 5.8 MOMO PAYMENT - Thanh toán MoMo

#### Tạo thanh toán MoMo (USER)
```
POST /api/momo/create
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "orderId": "order_id_here"
}

Response:
{
  "success": true,
  "data": {
    "payUrl": "https://test-payment.momo.vn/...",
    "orderId": "...",
    "momoOrderId": "MOMO123456789"
  }
}
```

#### Callback từ MoMo (IPN - MoMo tự động gọi)
```
POST /api/momo/ipn

MoMo tự động gọi khi:
- Thanh toán thành công (resultCode=0)
- User hủy (resultCode=1006)
- Timeout (resultCode=1007)
```

#### Luồng thanh toán MoMo
```
1. User chọn MoMo → Tạo đơn (stock giữ nguyên)
2. Redirect sang trang QR MoMo
3. User quét QR bằng App MoMo
4. MoMo callback:
   - Thành công → Trừ stock → Cập nhật PAID
   - Thất bại → Xóa đơn → Stock giữ nguyên
```

---

### 5.9 REVIEW - Đánh giá

#### Thêm đánh giá (USER)
```
POST /api/reviews
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "product_id",
  "rating": 5,
  "comment": "Sản phẩm rất tốt!"
}

rating: 1-5 sao
```

#### Lấy đánh giá theo sản phẩm (Công khai)
```
GET /api/reviews/product/:productId
```

#### Xóa đánh giá (USER)
```
DELETE /api/reviews/:id
Headers: Authorization: Bearer <token>
```

---

### 5.10 WISHLIST - Yêu thích (USER)

#### Lấy danh sách yêu thích
```
GET /api/wishlist
Headers: Authorization: Bearer <token>
```

#### Thêm vào yêu thích
```
POST /api/wishlist
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "product_id"
}
```

#### Xóa khỏi yêu thích
```
DELETE /api/wishlist/:productId
Headers: Authorization: Bearer <token>
```

---

### 5.11 CHAT - Nhắn tin (USER)

#### Lấy danh sách cuộc trò chuyện
```
GET /api/chat/conversations
Headers: Authorization: Bearer <token>
```

#### Lấy tin nhắn
```
GET /api/chat/conversations/:id/messages
Headers: Authorization: Bearer <token>
```

#### Gửi tin nhắn
```
POST /api/chat/messages
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "conversationId": "conversation_id",
  "content": "Xin chào!"
}
```

---

### 5.12 NOTIFICATION - Thông báo (USER)

#### Lấy danh sách thông báo
```
GET /api/notifications
Headers: Authorization: Bearer <token>
```

#### Lấy số thông báo chưa đọc
```
GET /api/notifications/unread-count
Headers: Authorization: Bearer <token>
```

#### Đánh dấu đã đọc
```
PUT /api/notifications/:id/read
Headers: Authorization: Bearer <token>
```

#### Đánh dấu đã đọc tất cả
```
PUT /api/notifications/read-all
Headers: Authorization: Bearer <token>
```

#### Xóa thông báo
```
DELETE /api/notifications/:id
Headers: Authorization: Bearer <token>
```

---

### 5.13 SSE - Real-time Events (ADMIN)

#### Kết nối SSE cho orders
```
GET /api/orders/sse
Headers: Authorization: Bearer <token> (ADMIN)

Event types nhận được:
- connected: Kết nối thành công
- NEW_ORDER: Có đơn hàng mới (Admin nhận notification)
- ORDER_STATUS_CHANGED: Trạng thái thay đổi
- new_notification: Có thông báo mới
```

---

### 5.14 ADMIN - Quản trị

#### Thống kê dashboard (ADMIN)
```
GET /api/admin/dashboard
Headers: Authorization: Bearer <token> (ADMIN)
```

#### Lấy danh sách users (ADMIN)
```
GET /api/admin/users
Headers: Authorization: Bearer <token> (ADMIN)
```

#### Cập nhật role user (ADMIN)
```
PUT /api/admin/users/:id/role
Headers: Authorization: Bearer <token> (ADMIN)
Content-Type: application/json

Body:
{
  "role": "STAFF"
}

role: USER | STAFF | ADMIN
```

---

## 6. CHỨC NĂNG TEST CHO ADMIN

### Danh sách API dành riêng cho ADMIN:

| # | Module | API | Mô tả |
|---|--------|-----|--------|
| 1 | Category | POST /api/categories | Thêm danh mục |
| 2 | Category | PUT /api/categories/:id | Sửa danh mục |
| 3 | Category | DELETE /api/categories/:id | Xóa danh mục |
| 4 | Product | POST /api/products | Thêm sản phẩm |
| 5 | Product | POST /api/products/upload | Upload ảnh sản phẩm |
| 6 | Product | PUT /api/products/:id | Sửa sản phẩm |
| 7 | Product | DELETE /api/products/:id | Xóa sản phẩm |
| 8 | Coupon | POST /api/coupons | Tạo mã giảm giá |
| 9 | Coupon | PUT /api/coupons/:id | Sửa mã giảm giá |
| 10 | Coupon | DELETE /api/coupons/:id | Xóa mã giảm giá |
| 11 | Order | GET /api/orders/all | Xem tất cả đơn hàng |
| 12 | Order | PUT /api/orders/:id/status | Cập nhật trạng thái đơn |
| 13 | Admin | GET /api/admin/dashboard | Xem thống kê |
| 14 | Admin | GET /api/admin/users | Xem danh sách users |
| 15 | Admin | PUT /api/admin/users/:id/role | Phân quyền user |
| 16 | SSE | GET /api/orders/sse | Kết nối real-time |

---

### Cách test chức năng ADMIN:

**Bước 1: Đăng nhập tài khoản ADMIN**
```
POST /api/auth/login
Body: {
  "email": "admin@gmail.com",
  "password": "admin123"
}
→ Nhận token có role = ADMIN
```

**Bước 2: Thêm token vào Header**
```
Authorization: Bearer <token_nhan_duoc>
```

**Bước 3: Test các API ADMIN**

---

## 7. HƯỚNG DẪN TEST POSTMAN CHI TIẾT:

### 1️⃣ Test CRUD Category (ADMIN):
```
1. POST /api/categories → Tạo danh mục mới
2. GET /api/categories → Xem danh sách
3. PUT /api/categories/:id → Sửa tên danh mục
4. DELETE /api/categories/:id → Xóa danh mục
```

### 2️⃣ Test CRUD Product (ADMIN):
```
1. POST /api/products → Tạo sản phẩm mới
2. POST /api/products/upload → Upload ảnh sản phẩm
3. GET /api/products → Xem sản phẩm
4. PUT /api/products/:id → Sửa thông tin sản phẩm
5. DELETE /api/products/:id → Xóa sản phẩm
```

### 3️⃣ Test CRUD Coupon (ADMIN):
```
1. POST /api/coupons → Tạo mã giảm giá
2. GET /api/coupons → Xem danh sách coupon
3. PUT /api/coupons/:id → Sửa coupon
4. DELETE /api/coupons/:id → Xóa coupon
```

### 4️⃣ Test Quản lý Orders (ADMIN):
```
1. GET /api/orders/all → Xem tất cả đơn hàng
2. PUT /api/orders/:id/status → Đổi trạng thái đơn:
   - CONFIRMED (Xác nhận đơn)
   - SHIPPED (Giao cho ĐVVC)
   - DELIVERING (Đang giao)
   - ARRIVED (Đã đến nơi)
   - COMPLETED (Hoàn tất)
   - CANCELLED (Hủy đơn)
```

### 5️⃣ Test Dashboard (ADMIN):
```
GET /api/admin/dashboard
→ Xem thống kê:
   - Tổng số users
   - Tổng số đơn hàng
   - Tổng doanh thu
   - Sản phẩm bán chạy
```

### 6️⃣ Test Phân quyền User (ADMIN):
```
1. GET /api/admin/users → Xem danh sách users
2. PUT /api/admin/users/:id/role → Đổi role:
   - USER → STAFF
   - STAFF → ADMIN
   - ADMIN → USER
```

---

## 8. ERROR CODES

| Status | Message | Nguyên nhân |
|--------|---------|-------------|
| 200 | Thành công | Request thành công |
| 201 | Tạo thành công | Resource được tạo |
| 400 | Bad Request | Dữ liệu không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập / Token hết hạn |
| 403 | Forbidden | Không có quyền thực hiện (không phải ADMIN) |
| 404 | Not Found | Resource không tồn tại |
| 500 | Server Error | Lỗi máy chủ |

---

## 9. PAYMENT FLOW - Luồng thanh toán

### COD (Cash On Delivery)
```
Tạo đơn → Trừ stock → Giao hàng → Thanh toán khi nhận → COMPLETED
```

### MoMo (Online Payment)
```
Tạo đơn (stock giữ nguyên)
    ↓
Redirect sang MoMo QR
    ↓
User quét QR bằng App MoMo
    ↓
┌─────────────────────────────────────┐
│ Thành công (resultCode=0)            │
│ → Trừ stock                         │
│ → Cập nhật paymentStatus = PAID     │
│ → Giao hàng → COMPLETED             │
└─────────────────────────────────────┘
    ↓ Hoặc
┌─────────────────────────────────────┐
│ Thất bại (resultCode≠0)              │
│ → Xóa đơn hàng                     │
│ → Stock giữ nguyên                  │
└─────────────────────────────────────┘
```

---

## 10. KẾT LUẬN

Dự án Clothing Shop đã hoàn thành các yêu cầu:

| Yêu cầu | Status |
|----------|--------|
| CRUD 10 models | ✅ |
| Authentication (JWT + Google OAuth) | ✅ |
| Authorization (USER/STAFF/ADMIN) | ✅ |
| Transaction (COD + MoMo) | ✅ |
| Upload images (Cloudinary) | ✅ |
| Real-time notifications (SSE) | ✅ |
| API Documentation | ✅ |

---

**SVTH:** [Họ tên]
**Ngày:** 08/04/2026
