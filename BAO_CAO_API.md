# 📘 BÁO CÁO API - CLOTHING SHOP

**Dự án:** Website Thương mại điện tử Clothing Shop
**Ngày nộp:** 08/04/2026
**GVHD:** [Tên thầy/cô]
**SVTH:** [Họ tên - MSSV]

---

## 1. TỔNG QUAN

### 1.1 Giới thiệu
- **Tên dự án:** Clothing Shop
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
Client (React) ──▶ API Server (Express) ──▶ MongoDB
                    │
                    ▼
               Cloudinary (Image)
                    │
Client ◀─────────────┘
                    │
                    ▼
               MoMo (Payment)
```

### 1.4 Phân quyền

| Role | Mô tả | Quyền |
|------|--------|--------|
| USER | Khách hàng | Mua hàng, xem đơn, chat |
| STAFF | Nhân viên | CRUD sản phẩm, quản lý đơn |
| ADMIN | Quản trị | Full access |

### 1.5 Ký hiệu
- **(Công khai):** Không cần token
- **(USER):** Cần token USER hoặc ADMIN
- **(ADMIN):** Bắt buộc token ADMIN

---

## 2. API TỔNG HỢP (DÙNG ĐỂ GIỚI THIỆU TEST)

**Base URL:** `https://clothing-shop-api-8wae.onrender.com/api`

### 2.1 AUTH
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/refresh-token`
- `POST /auth/change-password`
- `POST /auth/forgot-password`
- `POST /auth/reset-password/:token`

### 2.2 USER
- `GET /users/profile`
- `PUT /users/profile`
- `GET /users` (ADMIN)
- `PUT /users/:id/role` (ADMIN)
- `DELETE /users/:id` (ADMIN)

### 2.3 ADDRESS
- `GET /addresses`
- `GET /addresses/:id`
- `POST /addresses`
- `PUT /addresses/:id`
- `DELETE /addresses/:id`
- `PUT /addresses/:id/default`

### 2.4 CATEGORY
- `GET /categories`
- `POST /categories` (ADMIN)
- `PUT /categories/:id` (ADMIN)
- `DELETE /categories/:id` (ADMIN)

### 2.5 PRODUCT
- `GET /products`
- `GET /products/:id`
- `POST /products` (ADMIN/STAFF)
- `PUT /products/:id` (ADMIN/STAFF)
- `DELETE /products/:id` (ADMIN)
- `POST /products/upload` (ADMIN/STAFF)

### 2.6 COUPON
- `POST /coupons/validate`
- `GET /coupons` (ADMIN)
- `GET /coupons/:id` (ADMIN)
- `POST /coupons` (ADMIN)
- `PUT /coupons/:id` (ADMIN)
- `DELETE /coupons/:id` (ADMIN)

### 2.7 ORDER
- `GET /orders/sse`
- `POST /orders`
- `GET /orders/my`
- `GET /orders/:id`
- `GET /orders` (ADMIN/STAFF)
- `PUT /orders/:id/status` (ADMIN/STAFF)
- `PUT /orders/:id/paid-to-shipper` (USER)
- `PUT /orders/:id/cancel`
- `DELETE /orders/:id`
- `DELETE /orders/admin/:id` (ADMIN)

### 2.8 MOMO
- `POST /momo/create`
- `POST /momo/ipn`
- `GET /momo/return`
- `GET /momo/query/:orderId`

### 2.9 REVIEW
- `GET /reviews/product/:productId`
- `GET /reviews/product/:productId/average`
- `POST /reviews` (USER)
- `PUT /reviews/:id` (USER)
- `DELETE /reviews/:id` (USER)

### 2.10 WISHLIST
- `GET /wishlist`
- `POST /wishlist`
- `DELETE /wishlist/:productId`
- `GET /wishlist/check/:productId`

### 2.11 CHAT
- `GET /chat/sse`
- `POST /chat/send`
- `GET /chat/conversations/all`
- `GET /chat/users/list`
- `GET /chat/:userId`
- `PUT /chat/read/:userId`
- `GET /chat/unread/count`
- `DELETE /chat/message/:id`
- `DELETE /chat/conversation/:userId`

### 2.12 NOTIFICATION
- `GET /notifications`
- `GET /notifications/unread-count`
- `PUT /notifications/read-all`
- `DELETE /notifications/read`
- `GET /notifications/:id`
- `PUT /notifications/:id/read`
- `DELETE /notifications/:id`

### 2.13 ADMIN
- `GET /admin/stats`
- `GET /admin/stats/chart`

### 2.14 PAYMENT (MOCK LEGACY)
- `POST /payment/vnpay/create`
- `POST /payment/mock/confirm`
- `POST /payment/mock/cancel`

---

## 3. API ENDPOINTS CHI TIẾT

---

### 2.1 AUTH - Xác thực

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
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k",
      "name": "Nguyen Van A",
      "email": "usertest@gmail.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k",
      "name": "Nguyen Van A",
      "email": "usertest@gmail.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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

Response (200):
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
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

Response (200):
{
  "success": true,
  "message": "Email đặt lại mật khẩu đã được gửi"
}
```

---

### 2.2 USER - Người dùng (USER)

#### Lấy thông tin profile
```
GET /api/users/profile
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k",
    "name": "Nguyen Van A",
    "email": "usertest@gmail.com",
    "role": "USER",
    "avatar": "https://res.cloudinary.com/...",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
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

Response (200):
{
  "success": true,
  "message": "Cập nhật profile thành công",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k",
    "name": "Nguyen Van B",
    "email": "usertest@gmail.com"
  }
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

Response (200):
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

#### Upload avatar
```
POST /api/users/avatar
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- avatar: (file ảnh)

Response (200):
{
  "success": true,
  "message": "Upload avatar thành công",
  "data": {
    "url": "https://res.cloudinary.com/..."
  }
}
```

---

### 2.3 ADDRESS - Địa chỉ (USER)

#### Lấy danh sách địa chỉ
```
GET /api/addresses
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j1k",
      "fullName": "Nguyen Van A",
      "phone": "0123456789",
      "address": "123 Đường ABC",
      "city": "TPHCM",
      "district": "Quan 1",
      "ward": "Phường Bến Nghé",
      "isDefault": true
    }
  ]
}
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

Response (201):
{
  "success": true,
  "message": "Thêm địa chỉ thành công",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j1k",
    "fullName": "Nguyen Van A",
    "phone": "0123456789",
    ...
  }
}
```

#### Cập nhật địa chỉ
```
PUT /api/addresses/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "fullName": "Nguyen Van B",
  "phone": "0987654321"
}

Response (200):
{
  "success": true,
  "message": "Cập nhật địa chỉ thành công"
}
```

#### Xóa địa chỉ
```
DELETE /api/addresses/:id
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Xóa địa chỉ thành công"
}
```

---

### 2.4 CATEGORY - Danh mục

#### Lấy danh sách danh mục (Công khai)
```
GET /api/categories

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j2k",
      "name": "Áo Thun",
      "description": "Các loại áo thun",
      "productCount": 15
    }
  ]
}
```

#### Thêm danh mục (ADMIN)
```
POST /api/categories
Headers: Authorization: Bearer <token> (ADMIN)
Content-Type: application/json

Body:
{
  "name": "Áo Thun",
  "description": "Các loại áo thun nam nữ"
}

Response (201):
{
  "success": true,
  "message": "Thêm danh mục thành công",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j2k",
    "name": "Áo Thun",
    "description": "Các loại áo thun nam nữ"
  }
}
```

#### Cập nhật danh mục (ADMIN)
```
PUT /api/categories/:id
Headers: Authorization: Bearer <token> (ADMIN)
Content-Type: application/json

Body:
{
  "name": "Áo Thun Nam"
}

Response (200):
{
  "success": true,
  "message": "Cập nhật danh mục thành công"
}
```

#### Xóa danh mục (ADMIN)
```
DELETE /api/categories/:id
Headers: Authorization: Bearer <token> (ADMIN)

Response (200):
{
  "success": true,
  "message": "Xóa danh mục thành công"
}
```

---

### 2.5 PRODUCT - Sản phẩm

#### Lấy danh sách sản phẩm (Công khai)
```
GET /api/products
Query params: ?limit=20&page=1&category=65a1b2c3...

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j3k",
      "name": "Áo Thun Nam Cao Cấp",
      "description": "Áo thun chất lượng cao",
      "price": 299000,
      "stock": 50,
      "image": "https://res.cloudinary.com/...",
      "category": {
        "_id": "65a1b2c3...",
        "name": "Áo Thun"
      },
      "rating": 4.5,
      "reviewCount": 12
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "total": 100
  }
}
```

#### Lấy chi tiết sản phẩm (Công khai)
```
GET /api/products/:id

Response (200):
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j3k",
    "name": "Áo Thun Nam Cao Cấp",
    "description": "Áo thun chất lượng cao, vải mềm mịn",
    "price": 299000,
    "stock": 50,
    "image": "https://res.cloudinary.com/...",
    "category": {
      "_id": "65a1b2c3...",
      "name": "Áo Thun"
    },
    "soldCount": 25,
    "rating": 4.5
  }
}
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
  "category": "65a1b2c3d4e5f6g7h8i9j2k",
  "image": "https://res.cloudinary.com/image.jpg"
}

Response (201):
{
  "success": true,
  "message": "Thêm sản phẩm thành công",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j3k",
    "name": "Áo Thun Nam Cao Cấp",
    ...
  }
}
```

#### Upload hình ảnh sản phẩm (ADMIN)
```
POST /api/products/upload
Headers: Authorization: Bearer <token> (ADMIN)
Content-Type: multipart/form-data

Form Data:
- image: (file ảnh JPG/PNG/GIF/WebP, tối đa 5MB)

Response (200):
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "url": "https://clothing-shop-api.onrender.com/uploads/product-123.jpg",
    "filename": "product-123.jpg"
  }
}
```

#### Cập nhật sản phẩm (ADMIN)
```
PUT /api/products/:id
Headers: Authorization: Bearer <token> (ADMIN)
Content-Type: application/json

Body:
{
  "name": "Áo Thun Nam VIP",
  "price": 399000,
  "stock": 30
}

Response (200):
{
  "success": true,
  "message": "Cập nhật sản phẩm thành công"
}
```

#### Xóa sản phẩm (ADMIN)
```
DELETE /api/products/:id
Headers: Authorization: Bearer <token> (ADMIN)

Response (200):
{
  "success": true,
  "message": "Xóa sản phẩm thành công"
}
```

---

### 2.6 COUPON - Mã giảm giá

#### Lấy danh sách coupon (Công khai)
```
GET /api/coupons

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j4k",
      "code": "SUMMER2026",
      "discountType": "PERCENTAGE",
      "discountValue": 20,
      "minOrderValue": 100000,
      "maxDiscount": 50000,
      "usageLimit": 100,
      "usageCount": 45,
      "expiresAt": "2026-12-31T00:00:00.000Z",
      "isActive": true
    }
  ]
}
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

Response (201):
{
  "success": true,
  "message": "Tạo coupon thành công",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j4k",
    "code": "SUMMER2026",
    ...
  }
}
```

#### Cập nhật coupon (ADMIN)
```
PUT /api/coupons/:id
Headers: Authorization: Bearer <token> (ADMIN)
Content-Type: application/json

Body:
{
  "usageLimit": 200
}

Response (200):
{
  "success": true,
  "message": "Cập nhật coupon thành công"
}
```

#### Xóa coupon (ADMIN)
```
DELETE /api/coupons/:id
Headers: Authorization: Bearer <token> (ADMIN)

Response (200):
{
  "success": true,
  "message": "Xóa coupon thành công"
}
```

---

### 2.7 ORDER - Đơn hàng

#### Tạo đơn hàng (USER)
```
POST /api/orders
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "items": [
    { "productId": "65a1b2c3d4e5f6g7h8i9j3k", "quantity": 2 }
  ],
  "couponCode": "SUMMER2026",
  "shippingAddress": {
    "fullName": "Nguyen Van A",
    "phone": "0123456789",
    "address": "123 Đường ABC, TPHCM"
  },
  "paymentMethod": "COD"
}

Response (201):
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j5k",
    "user": "65a1b2c3d4e5f6g7h8i9j0k",
    "items": [...],
    "totalPrice": 598000,
    "finalPrice": 478400,
    "status": "PENDING",
    "paymentMethod": "COD",
    "paymentStatus": "PENDING"
  }
}
```

#### Lấy đơn hàng của tôi (USER)
```
GET /api/orders/my
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j5k",
      "status": "PENDING",
      "paymentMethod": "COD",
      "paymentStatus": "PENDING",
      "finalPrice": 478400,
      "createdAt": "2026-03-28T00:00:00.000Z",
      "items": [
        {
          "product": {
            "name": "Áo Thun Nam Cao Cấp",
            "image": "https://..."
          },
          "quantity": 2,
          "price": 299000
        }
      ]
    }
  ]
}
```

#### Lấy chi tiết đơn hàng (USER)
```
GET /api/orders/:id
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j5k",
    "status": "PENDING",
    "paymentMethod": "COD",
    "paymentStatus": "PENDING",
    "totalPrice": 598000,
    "discountAmount": 119600,
    "finalPrice": 478400,
    "shippingAddress": {
      "fullName": "Nguyen Van A",
      "phone": "0123456789",
      "address": "123 Đường ABC, TPHCM"
    },
    "createdAt": "2026-03-28T00:00:00.000Z"
  }
}
```

#### Lấy tất cả đơn hàng (ADMIN)
```
GET /api/orders/all
Headers: Authorization: Bearer <token> (ADMIN)

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j5k",
      "user": {
        "name": "Nguyen Van A",
        "email": "usertest@gmail.com"
      },
      "status": "PENDING",
      "paymentMethod": "COD",
      "paymentStatus": "PENDING",
      "finalPrice": 478400,
      "createdAt": "2026-03-28T00:00:00.000Z"
    }
  ]
}
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

Các status hợp lệ:
- PENDING: Chờ xác nhận
- CONFIRMED: Đã xác nhận
- SHIPPED: Đã giao ĐVVC
- DELIVERING: Đang giao
- ARRIVED: Đã đến nơi
- PAID_TO_SHIPPER: Đã thanh toán cho shipper
- COMPLETED: Hoàn tất
- CANCELLED: Đã hủy

Response (200):
{
  "success": true,
  "message": "Cập nhật trạng thái thành công"
}
```

#### Xác nhận thanh toán cho shipper (USER - COD)
```
POST /api/orders/:id/confirm-paid-shipper
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Xác nhận thanh toán cho shipper thành công"
}
```

#### Hủy đơn hàng (USER)
```
DELETE /api/orders/:id
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Hủy đơn hàng thành công"
}
```

---

### 2.8 MOMO PAYMENT - Thanh toán MoMo

#### Tạo thanh toán MoMo (USER)
```
POST /api/momo/create
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "orderId": "65a1b2c3d4e5f6g7h8i9j5k"
}

Response (200):
{
  "success": true,
  "message": "Tạo payment thành công",
  "data": {
    "payUrl": "https://test-payment.momo.vn/v2/gateway/...",
    "orderId": "65a1b2c3d4e5f6g7h8i9j5k",
    "momoOrderId": "MOMO1741234567890"
  }
}
```

#### Callback từ MoMo (MoMo tự động gọi)
```
POST /api/momo/ipn

resultCode:
- 0: Thành công
- 1006: User hủy
- 1007: Timeout

Response (200):
{
  "status": "SUCCESS"
}
```

#### Luồng thanh toán MoMo
```
1. User chọn MoMo → Tạo đơn (stock CHƯA trừ)
2. Redirect sang MoMo QR
3. User quét QR bằng App MoMo
4. MoMo callback:
   ┌─────────────────────────────────────┐
   │ Thành công (resultCode=0)            │
   │ → Trừ stock                        │
   │ → Cập nhật paymentStatus = PAID   │
   │ → Giao hàng → COMPLETED            │
   └─────────────────────────────────────┘
   ┌─────────────────────────────────────┐
   │ Thất bại (resultCode≠0)              │
   │ → Xóa đơn hàng                   │
   │ → Stock giữ nguyên                  │
   └─────────────────────────────────────┘
```

---

### 2.9 REVIEW - Đánh giá

#### Thêm đánh giá (USER)
```
POST /api/reviews
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "65a1b2c3d4e5f6g7h8i9j3k",
  "rating": 5,
  "comment": "Sản phẩm rất tốt, giao hàng nhanh!"
}

Response (201):
{
  "success": true,
  "message": "Thêm đánh giá thành công",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j6k",
    "product": "65a1b2c3...",
    "rating": 5,
    "comment": "Sản phẩm rất tốt, giao hàng nhanh!",
    "user": {
      "name": "Nguyen Van A"
    }
  }
}
```

#### Lấy đánh giá theo sản phẩm (Công khai)
```
GET /api/reviews/product/:productId

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j6k",
      "rating": 5,
      "comment": "Sản phẩm rất tốt!",
      "user": { "name": "Nguyen Van A" },
      "createdAt": "2026-03-28T00:00:00.000Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 12
}
```

#### Xóa đánh giá (USER)
```
DELETE /api/reviews/:id
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Xóa đánh giá thành công"
}
```

---

### 2.10 WISHLIST - Yêu thích (USER)

#### Lấy danh sách yêu thích
```
GET /api/wishlist
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j7k",
      "product": {
        "_id": "65a1b2c3...",
        "name": "Áo Thun Nam Cao Cấp",
        "price": 299000,
        "image": "https://..."
      },
      "createdAt": "2026-03-28T00:00:00.000Z"
    }
  ]
}
```

#### Thêm vào yêu thích
```
POST /api/wishlist
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "65a1b2c3d4e5f6g7h8i9j3k"
}

Response (201):
{
  "success": true,
  "message": "Thêm vào yêu thích thành công"
}
```

#### Xóa khỏi yêu thích
```
DELETE /api/wishlist/:productId
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Xóa khỏi yêu thích thành công"
}
```

---

### 2.11 CHAT - Nhắn tin (USER)

#### Lấy danh sách cuộc trò chuyện
```
GET /api/chat/conversations
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j8k",
      "participants": [
        { "_id": "65a1b2c3...", "name": "Nguyen Van A" },
        { "_id": "65a1b2c3...", "name": "Admin Shop" }
      ],
      "lastMessage": {
        "content": "Cảm ơn bạn!",
        "createdAt": "2026-03-28T00:00:00.000Z"
      }
    }
  ]
}
```

#### Lấy tin nhắn trong cuộc trò chuyện
```
GET /api/chat/conversations/:conversationId/messages
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j9k",
      "sender": { "_id": "65a1b2c3...", "name": "Nguyen Van A" },
      "content": "Cho tôi hỏi về sản phẩm",
      "createdAt": "2026-03-28T00:00:00.000Z"
    }
  ]
}
```

#### Gửi tin nhắn
```
POST /api/chat/messages
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "conversationId": "65a1b2c3d4e5f6g7h8i9j8k",
  "content": "Cho tôi hỏi về sản phẩm"
}

Response (201):
{
  "success": true,
  "message": "Gửi tin nhắn thành công",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j9k",
    "content": "Cho tôi hỏi về sản phẩm",
    "sender": "65a1b2c3...",
    "createdAt": "2026-03-28T00:00:00.000Z"
  }
}
```

---

### 2.12 NOTIFICATION - Thông báo (USER)

#### Lấy danh sách thông báo
```
GET /api/notifications
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j10k",
      "title": "📦 Đơn hàng mới",
      "message": "Bạn có đơn hàng mới #ABC123",
      "type": "ORDER_STATUS",
      "isRead": false,
      "createdAt": "2026-03-28T00:00:00.000Z"
    }
  ],
  "unreadCount": 5
}
```

#### Lấy số thông báo chưa đọc
```
GET /api/notifications/unread-count
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": { "count": 5 }
}
```

#### Đánh dấu đã đọc
```
PUT /api/notifications/:id/read
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Đánh dấu đã đọc thành công"
}
```

#### Đánh dấu đã đọc tất cả
```
PUT /api/notifications/read-all
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Đánh dấu tất cả đã đọc thành công"
}
```

#### Xóa thông báo
```
DELETE /api/notifications/:id
Headers: Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Xóa thông báo thành công"
}
```

---

### 2.13 SSE - Real-time Events (ADMIN)

#### Kết nối SSE
```
GET /api/orders/sse
Headers: Authorization: Bearer <token> (ADMIN)

Response (SSE Stream):
event: connected
data: {"type":"connected","userId":"65a1b2c3..."}

event: NEW_ORDER
data: {"type":"NEW_ORDER","orderId":"65a1b2c3...","message":"📦 Đơn hàng mới #ABC123"}

event: ORDER_STATUS_CHANGED
data: {"type":"ORDER_STATUS_CHANGED","orderId":"65a1b2c3...","newStatus":"CONFIRMED"}

event: new_notification
data: {"type":"new_notification","notification":{...}}
```

---

### 2.14 ADMIN - Quản trị

#### Thống kê dashboard (ADMIN)
```
GET /api/admin/dashboard
Headers: Authorization: Bearer <token> (ADMIN)

Response (200):
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalOrders": 89,
    "totalRevenue": 45678900,
    "topProducts": [
      {
        "product": { "name": "Áo Thun Nam" },
        "soldCount": 25
      }
    ]
  }
}
```

#### Lấy danh sách users (ADMIN)
```
GET /api/admin/users
Headers: Authorization: Bearer <token> (ADMIN)

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k",
      "name": "Nguyen Van A",
      "email": "usertest@gmail.com",
      "role": "USER",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
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

Response (200):
{
  "success": true,
  "message": "Cập nhật role thành công"
}
```

---

## 3. DANH SÁCH API DÀNH CHO ADMIN (16 APIs)

| # | Module | API | Mô tả |
|---|--------|-----|--------|
| 1 | Category | POST /api/categories | Thêm danh mục |
| 2 | Category | PUT /api/categories/:id | Sửa danh mục |
| 3 | Category | DELETE /api/categories/:id | Xóa danh mục |
| 4 | Product | POST /api/products | Thêm sản phẩm |
| 5 | Product | POST /api/products/upload | Upload ảnh |
| 6 | Product | PUT /api/products/:id | Sửa sản phẩm |
| 7 | Product | DELETE /api/products/:id | Xóa sản phẩm |
| 8 | Coupon | POST /api/coupons | Tạo coupon |
| 9 | Coupon | PUT /api/coupons/:id | Sửa coupon |
| 10 | Coupon | DELETE /api/coupons/:id | Xóa coupon |
| 11 | Order | GET /api/orders/all | Xem tất cả đơn |
| 12 | Order | PUT /api/orders/:id/status | Cập nhật trạng thái |
| 13 | Admin | GET /api/admin/dashboard | Xem thống kê |
| 14 | Admin | GET /api/admin/users | Xem danh sách users |
| 15 | Admin | PUT /api/admin/users/:id/role | Phân quyền user |
| 16 | SSE | GET /api/orders/sse | Real-time notification |

---

## 4. ERROR CODES

| Status | Message | Nguyên nhân |
|--------|---------|-------------|
| 200 | Thành công | Request thành công |
| 201 | Tạo thành công | Resource được tạo mới |
| 400 | Bad Request | Dữ liệu không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập / Token hết hạn |
| 403 | Forbidden | Token không phải ADMIN |
| 404 | Not Found | Resource không tồn tại |
| 500 | Server Error | Lỗi máy chủ |

---

## 5. KẾT LUẬN

| Yêu cầu | Status |
|----------|--------|
| CRUD 10 models | ✅ |
| Authentication (JWT + Google OAuth) | ✅ |
| Authorization (USER/STAFF/ADMIN) | ✅ |
| Transaction (COD + MoMo) | ✅ |
| Upload images (Cloudinary) | ✅ |
| Real-time notifications (SSE) | ✅ |

---

**SVTH:** [Họ tên]
**Ngày:** 08/04/2026
