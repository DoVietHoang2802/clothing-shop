# API Documentation - Clothing Shop

## Base URL

- **Development:** `http://localhost:5000/api`
- **Production:** `https://clothing-shop-api-8wae.onrender.com/api`

---

## Authentication

### 1. AUTH - Xác thực

#### POST `/api/auth/register` - Đăng ký tài khoản
- **Access:** Public
- **Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "example@email.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": { "id", "name", "email", "role" },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

#### POST `/api/auth/login` - Đăng nhập
- **Access:** Public
- **Body:**
```json
{
  "email": "example@email.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": { "id", "name", "email", "role" },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

#### POST `/api/auth/google` - Đăng nhập với Google
- **Access:** Public
- **Body:**
```json
{
  "googleToken": "idToken_từ_Firebase"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Đăng nhập với Google thành công",
  "data": {
    "user": { "id", "name", "email", "role", "avatar" },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

#### POST `/api/auth/refresh-token` - Làm mới token
- **Access:** Public
- **Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1..."
}
```

#### POST `/api/auth/change-password` - Đổi mật khẩu
- **Access:** Private (Cần token)
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

---

### 2. USER - Người dùng

#### GET `/api/users/profile` - Lấy thông tin profile
- **Access:** Private
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Nguyễn Văn A",
    "email": "example@email.com",
    "role": "USER",
    "avatar": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT `/api/users/profile` - Cập nhật profile
- **Access:** Private
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "name": "Tên mới",
  "avatar": "url_ảnh_mới"
}
```

#### GET `/api/users` - Lấy danh sách người dùng (Admin)
- **Access:** Private (ADMIN only)
- **Headers:** `Authorization: Bearer <token>`

#### PUT `/api/users/:id/role` - Cập nhật vai trò người dùng
- **Access:** Private (ADMIN only)
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "role": "ADMIN" // USER, STAFF, ADMIN
}
```

#### DELETE `/api/users/:id` - Xóa người dùng
- **Access:** Private (ADMIN only)

---

### 3. PRODUCT - Sản phẩm

#### GET `/api/products` - Lấy danh sách sản phẩm
- **Access:** Public
- **Query Parameters:**
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số sản phẩm/trang (mặc định: 12)
  - `category`: Lọc theo danh mục
  - `search`: Tìm kiếm theo tên
  - `minPrice`: Giá tối thiểu
  - `maxPrice`: Giá tối đa
  - `sortBy`: Sắp xếp (price_asc, price_desc, newest, name_asc)
- **Example:** `/api/products?category=ao&search=quan&minPrice=100000&maxPrice=500000&sortBy=price_asc`

#### GET `/api/products/:id` - Lấy chi tiết sản phẩm
- **Access:** Public

#### POST `/api/products` - Tạo sản phẩm mới
- **Access:** Private (ADMIN, STAFF)
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "name": "Áo Thun Nam",
  "description": "Mô tả sản phẩm",
  "price": 250000,
  "category": "category_id",
  "stock": 100,
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["Trắng", "Đen", "Xanh"],
  "images": ["url1.jpg", "url2.jpg"]
}
```

#### PUT `/api/products/:id` - Cập nhật sản phẩm
- **Access:** Private (ADMIN, STAFF)

#### DELETE `/api/products/:id` - Xóa sản phẩm
- **Access:** Private (ADMIN only)

---

### 4. CATEGORY - Danh mục

#### GET `/api/categories` - Lấy danh sách danh mục
- **Access:** Public

#### POST `/api/categories` - Tạo danh mục mới
- **Access:** Private (ADMIN only)
- **Body:**
```json
{
  "name": "Áo Nam",
  "description": "Danh mục áo nam"
}
```

#### PUT `/api/categories/:id` - Cập nhật danh mục
- **Access:** Private (ADMIN only)

#### DELETE `/api/categories/:id` - Xóa danh mục
- **Access:** Private (ADMIN only)

---

### 5. ORDER - Đơn hàng

#### POST `/api/orders` - Tạo đơn hàng
- **Access:** Private (USER, STAFF, ADMIN)
- **Body:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "name": "Áo Thun",
      "price": 250000,
      "quantity": 2,
      "size": "M",
      "color": "Trắng"
    }
  ],
  "shippingAddress": {
    "fullName": "Nguyễn Văn A",
    "phone": "0123456789",
    "address": "123 Đường ABC, Quận 1, TP.HCM"
  },
  "paymentMethod": "COD", // COD, VNPAY
  "couponCode": "GIAM10" // optional
}
```

#### GET `/api/orders/my` - Lấy đơn hàng của tôi
- **Access:** Private

#### GET `/api/orders/:id` - Lấy chi tiết đơn hàng
- **Access:** Private

#### PUT `/api/orders/:id/cancel` - Hủy đơn hàng
- **Access:** Private

#### GET `/api/orders` - Lấy tất cả đơn hàng (Admin)
- **Access:** Private (ADMIN only)

#### PUT `/api/orders/:id/status` - Cập nhật trạng thái đơn hàng
- **Access:** Private (ADMIN, STAFF)
- **Body:**
```json
{
  "status": "PENDING" // PENDING, CONFIRMED, SHIPPED, COMPLETED, CANCELLED
}
```

---

### 6. COUPON - Mã giảm giá

#### POST `/api/coupons/validate` - Xác thực coupon
- **Access:** Public
- **Body:**
```json
{
  "code": "GIAM10",
  "orderTotal": 500000
}
```

#### GET `/api/coupons` - Lấy danh sách coupon
- **Access:** Private (ADMIN only)

#### POST `/api/coupons` - Tạo coupon mới
- **Access:** Private (ADMIN only)
- **Body:**
```json
{
  "code": "GIAM10",
  "discountType": "PERCENTAGE", // PERCENTAGE hoặc FIXED
  "discountValue": 10, // 10% hoặc 50000 VND
  "minOrderValue": 200000,
  "maxDiscount": 50000,
  "usageLimit": 100,
  "expiresAt": "2024-12-31",
  "isActive": true
}
```

#### PUT `/api/coupons/:id` - Cập nhật coupon
- **Access:** Private (ADMIN only)

#### DELETE `/api/coupons/:id` - Xóa coupon
- **Access:** Private (ADMIN only)

---

### 7. WISHLIST - Yêu thích

#### GET `/api/wishlist` - Lấy danh sách yêu thích
- **Access:** Private

#### POST `/api/wishlist` - Thêm vào yêu thích
- **Access:** Private
- **Body:**
```json
{
  "productId": "product_id"
}
```

#### DELETE `/api/wishlist/:productId` - Xóa khỏi yêu thích
- **Access:** Private

#### GET `/api/wishlist/check/:productId` - Kiểm tra sản phẩm yêu thích
- **Access:** Private

---

### 8. REVIEW - Đánh giá

#### GET `/api/reviews/product/:productId` - Lấy đánh giá của sản phẩm
- **Access:** Public

#### GET `/api/reviews/product/:productId/average` - Lấy đánh giá trung bình
- **Access:** Public

#### POST `/api/reviews` - Tạo đánh giá
- **Access:** Private (USER)
- **Body:**
```json
{
  "productId": "product_id",
  "rating": 5,
  "comment": "Sản phẩm rất tốt!"
}
```

#### PUT `/api/reviews/:id` - Cập nhật đánh giá
- **Access:** Private (USER)

#### DELETE `/api/reviews/:id` - Xóa đánh giá
- **Access:** Private (USER)

---

### 9. ADMIN - Thống kê

#### GET `/api/admin/stats` - Lấy thống kê dashboard
- **Access:** Private (ADMIN only)
- **Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalProducts": 50,
    "totalCategories": 10,
    "totalOrders": 200,
    "totalRevenue": 50000000,
    "pendingOrders": 20,
    "shippedOrders": 50,
    "completedOrderCount": 120,
    "cancelledOrders": 10,
    "lowStockProducts": 5,
    "newUsersThisMonth": 15
  }
}
```

---

### 10. PAYMENT - Thanh toán (Mock VNPay)

#### POST `/api/payment/vnpay/create` - Tạo link thanh toán mock
- **Access:** Private (USER)
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "orderId": "order_id"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Tạo link thanh toán thành công",
  "data": {
    "paymentUrl": "/mock-payment?orderId=xxx&amount=xxx",
    "orderId": "xxx",
    "amount": 500000
  }
}
```

#### POST `/api/payment/mock/confirm` - Xác nhận thanh toán mock
- **Access:** Private (USER)
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "orderId": "order_id"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Thanh toán thành công!",
  "data": {
    "orderId": "xxx",
    "paymentStatus": "PAID",
    "status": "CONFIRMED"
  }
}
```

#### POST `/api/payment/mock/cancel` - Hủy thanh toán mock
- **Access:** Private (USER)
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "orderId": "order_id"
}
```
- **Note:** Khi hủy, đơn hàng sẽ bị CANCELLED và stock sẽ được restore

---

### 11. WITHDRAWAL - Rút tiền

#### GET `/api/withdrawals/balance` - Lấy số dư khả dụng
- **Access:** Private (USER)
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 5000000,
    "totalWithdrawn": 1000000,
    "availableBalance": 4000000
  }
}
```

#### POST `/api/withdrawals` - Tạo yêu cầu rút tiền
- **Access:** Private (USER)
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "amount": 1000000,
  "bankName": "Vietcombank",
  "accountNumber": "1234567890",
  "accountHolder": "NGUYEN VAN A"
}
```
- **Note:** Số tiền rút tối thiểu là 10,000 VNĐ

#### GET `/api/withdrawals/my` - Lấy danh sách rút tiền của tôi
- **Access:** Private (USER)

#### GET `/api/withdrawals` - Lấy tất cả yêu cầu rút tiền (Admin)
- **Access:** Private (ADMIN)

#### PUT `/api/withdrawals/:id/status` - Cập nhật trạng thái rút tiền (Admin)
- **Access:** Private (ADMIN)
- **Body:**
```json
{
  "status": "COMPLETED",
  "note": "Đã chuyển khoản"
}
```
- **Status values:** PENDING, APPROVED, REJECTED, COMPLETED

---

### 12. CHAT - Nhắn tin

#### POST `/api/chat/send` - Gửi tin nhắn
- **Access:** Private (USER, STAFF, ADMIN)
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "receiverId": "user_id",
  "message": "Xin chào, tôi cần hỗ trợ!"
}
```

#### GET `/api/chat/:userId` - Lấy tin nhắn với một người
- **Access:** Private

#### GET `/api/chat/conversations/all` - Lấy danh sách cuộc trò chuyện
- **Access:** Private
- **Response:**
```json
{
  "success": true,
  "data": [
    {
      "user": {
        "_id": "xxx",
        "name": "Admin",
        "email": "admin@shop.com",
        "avatar": "https://...",
        "role": "ADMIN"
      },
      "lastMessage": {
        "sender": "xxx",
        "receiver": "xxx",
        "message": "Tin nhắn cuối",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "unreadCount": 2
    }
  ]
}
```

#### GET `/api/chat/users/list` - Lấy danh sách admin/staff để chat
- **Access:** Private

#### PUT `/api/chat/read/:userId` - Đánh dấu tin nhắn đã đọc
- **Access:** Private

#### GET `/api/chat/unread/count` - Lấy số tin nhắn chưa đọc
- **Access:** Private
- **Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

### 13. ORDER - Trạng thái đơn hàng (Chi tiết)

#### Order Status Flow
```
PENDING → CONFIRMED → SHIPPED → DELIVERING → ARRIVED → PAID_TO_SHIPPER → COMPLETED
    ↓
CANCELLED (có thể hủy ở PENDING, CONFIRMED)
```

#### Trạng thái đơn hàng:
| Status | Mô tả | Có thể hủy | Có thể xóa |
|--------|-------|-------------|-------------|
| PENDING | Chờ xác nhận | ✅ | ❌ |
| CONFIRMED | Đã xác nhận | ✅ | ❌ |
| SHIPPED | Đã giao ĐVVC | ❌ | ❌ |
| DELIVERING | Đang giao | ❌ | ❌ |
| ARRIVED | Đã đến nơi | ❌ | ❌ |
| PAID_TO_SHIPPER | Đã thanh toán cho shipper | ❌ | ✅ |
| COMPLETED | Hoàn tất | ❌ | ✅ |
| CANCELLED | Đã hủy | ❌ | ✅ |

#### Payment Status:
| Status | Mô tả |
|--------|-------|
| UNPAID | Chưa thanh toán |
| PAID | Đã thanh toán |
| FAILED | Thanh toán thất bại |

---

### 14. ROLES & PERMISSIONS

| Tính năng | USER | STAFF | ADMIN |
|-----------|:----:|:-----:|:-----:|
| Xem sản phẩm | ✅ | ✅ | ✅ |
| Mua hàng | ✅ | ✅ | ✅ |
| CRUD sản phẩm | ❌ | ✅ | ✅ |
| CRUD danh mục | ❌ | ❌ | ✅ |
| Quản lý đơn hàng | ❌ | ✅ | ✅ |
| CRUD coupon | ❌ | ❌ | ✅ |
| Xem thống kê | ❌ | ❌ | ✅ |
| Quản lý user | ❌ | ❌ | ✅ |
| Rút tiền | ✅ | ✅ | ✅ |
| Quản lý rút tiền | ❌ | ❌ | ✅ |
| Nhắn tin | ✅ | ✅ | ✅ |

---

## User Roles

| Role | Description |
|------|-------------|
| `USER` | Người dùng thông thường |
| `STAFF` | Nhân viên (có thể quản lý sản phẩm, đơn hàng) |
| `ADMIN` | Quản trị viên (toàn quyền) |

---

## Authentication Token

Tất cả API private cần token trong header:
```
Authorization: Bearer <token>
```

Token có hiệu lực trong 7 ngày.

---

## Error Response Format

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "data": null
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |
