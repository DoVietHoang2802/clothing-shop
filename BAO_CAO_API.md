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

---

## 4. API ENDPOINTS

---

### 4.1 AUTH - Xác thực

#### Đăng ký tài khoản
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

#### Đăng nhập
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

#### Đăng nhập Google OAuth
```
POST /api/auth/google
Content-Type: application/json

Body:
{
  "idToken": "google_id_token_here"
}
```

#### Quên mật khẩu
```
POST /api/auth/forgot-password
Content-Type: application/json

Body:
{
  "email": "usertest@gmail.com"
}
```

---

### 4.2 USER - Người dùng

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

### 4.3 ADDRESS - Địa chỉ

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

### 4.4 CATEGORY - Danh mục

#### Lấy danh sách danh mục
```
GET /api/categories
```

#### Thêm danh mục (Admin)
```
POST /api/categories
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Áo Thun",
  "description": "Các loại áo thun"
}
```

#### Cập nhật danh mục (Admin)
```
PUT /api/categories/:id
Headers: Authorization: Bearer <token>
```

#### Xóa danh mục (Admin)
```
DELETE /api/categories/:id
Headers: Authorization: Bearer <token>
```

---

### 4.5 PRODUCT - Sản phẩm

#### Lấy danh sách sản phẩm
```
GET /api/products
Query params: ?limit=20&page=1&category=id
```

#### Lấy chi tiết sản phẩm
```
GET /api/products/:id
```

#### Thêm sản phẩm (Admin)
```
POST /api/products
Headers: Authorization: Bearer <token>
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

#### Upload hình ảnh sản phẩm
```
POST /api/products/upload
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- image: (file ảnh JPG/PNG/GIF/WebP, tối đa 5MB)
```

#### Cập nhật sản phẩm (Admin)
```
PUT /api/products/:id
Headers: Authorization: Bearer <token>
```

#### Xóa sản phẩm (Admin)
```
DELETE /api/products/:id
Headers: Authorization: Bearer <token>
```

---

### 4.6 COUPON - Mã giảm giá

#### Lấy danh sách coupon
```
GET /api/coupons
```

#### Tạo coupon (Admin)
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

discountType: PERCENTAGE | FIXED
```

#### Cập nhật coupon (Admin)
```
PUT /api/coupons/:id
Headers: Authorization: Bearer <token>
```

#### Xóa coupon (Admin)
```
DELETE /api/coupons/:id
Headers: Authorization: Bearer <token>
```

---

### 4.7 ORDER - Đơn hàng

#### Tạo đơn hàng
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

#### Lấy đơn hàng của tôi
```
GET /api/orders/my
Headers: Authorization: Bearer <token>
```

#### Lấy chi tiết đơn hàng
```
GET /api/orders/:id
Headers: Authorization: Bearer <token>
```

#### Cập nhật trạng thái đơn hàng (Admin)
```
PUT /api/orders/:id/status
Headers: Authorization: Bearer <token>
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

#### Xác nhận thanh toán cho shipper (COD)
```
POST /api/orders/:id/confirm-paid-shipper
Headers: Authorization: Bearer <token>
```

#### Hủy đơn hàng
```
DELETE /api/orders/:id
Headers: Authorization: Bearer <token>
```

#### Lấy tất cả đơn hàng (Admin)
```
GET /api/orders/all
Headers: Authorization: Bearer <token>
```

---

### 4.8 MOMO PAYMENT - Thanh toán MoMo

#### Tạo thanh toán MoMo
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

#### Callback từ MoMo (IPN)
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

### 4.9 REVIEW - Đánh giá

#### Thêm đánh giá
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

#### Lấy đánh giá theo sản phẩm
```
GET /api/reviews/product/:productId
```

#### Xóa đánh giá
```
DELETE /api/reviews/:id
Headers: Authorization: Bearer <token>
```

---

### 4.10 WISHLIST - Yêu thích

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

### 4.11 CHAT - Nhắn tin

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

### 4.12 NOTIFICATION - Thông báo

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

### 4.13 SSE - Real-time Events

#### Kết nối SSE cho orders
```
GET /api/orders/sse
Headers: Authorization: Bearer <token>

Event types nhận được:
- connected: Kết nối thành công
- NEW_ORDER: Có đơn hàng mới (Admin nhận)
- ORDER_STATUS_CHANGED: Trạng thái thay đổi
- new_notification: Có thông báo mới
```

---

### 4.14 ADMIN - Quản trị

#### Thống kê dashboard
```
GET /api/admin/dashboard
Headers: Authorization: Bearer <token>
```

#### Lấy danh sách users
```
GET /api/admin/users
Headers: Authorization: Bearer <token>
```

#### Cập nhật role user
```
PUT /api/admin/users/:id/role
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "role": "STAFF"
}

role: USER | STAFF | ADMIN
```

---

## 5. ERROR CODES

| Status | Message | Nguyên nhân |
|--------|---------|-------------|
| 200 | Thành công | Request thành công |
| 201 | Tạo thành công | Resource được tạo |
| 400 | Bad Request | Dữ liệu không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập / Token hết hạn |
| 403 | Forbidden | Không có quyền thực hiện |
| 404 | Not Found | Resource không tồn tại |
| 500 | Server Error | Lỗi máy chủ |

---

## 6. PAYMENT FLOW - Luồng thanh toán

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
│ Thành công (resultCode=0)          │
│ → Trừ stock                       │
│ → Cập nhật paymentStatus = PAID   │
│ → Giao hàng → COMPLETED            │
└─────────────────────────────────────┘
    ↓ Hoặc
┌─────────────────────────────────────┐
│ Thất bại (resultCode≠0)            │
│ → Xóa đơn hàng                    │
│ → Stock giữ nguyên                 │
└─────────────────────────────────────┘
```

---

## 7. KẾT LUẬN

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
