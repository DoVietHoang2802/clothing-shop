# 📋 Hướng Dẫn Test API - Localhost

**Base URL:** `http://localhost:5000/api`

**Tools:** Postman, Thunder Client, hoặc cURL

---

## 🔐 1. AUTH - Xác Thực

### 1.1 Đăng ký tài khoản
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "Nguyễn Văn Test",
  "email": "testuser@localhost.com",
  "password": "123456"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": { "id", "name", "email", "role": "USER" },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

### 1.2 Đăng nhập
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "testuser@localhost.com",
  "password": "123456"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": { "id", "name", "email", "role": "USER" },
    "token": "eyJhbGciOiJIUzI1..."
  }
}
```

### 1.3 Đăng nhập Google (Mock - cần Firebase config)
```
POST /api/auth/google
Content-Type: application/json

Body:
{
  "googleToken": "idToken_từ_Firebase"
}
```

### 1.4 Quên mật khẩu
```
POST /api/auth/forgot-password
Content-Type: application/json

Body:
{
  "email": "testuser@localhost.com"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Email đặt lại mật khẩu đã được gửi"
}
```

---

## 👤 2. USER - Người Dùng

### 2.1 Lấy thông tin profile
```
GET /api/users/profile
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Nguyễn Văn Test",
    "email": "testuser@localhost.com",
    "role": "USER",
    "createdAt": "2026-03-22T00:00:00.000Z"
  }
}
```

### 2.2 Cập nhật profile
```
PUT /api/users/profile
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Tên Mới",
  "avatar": "https://example.com/avatar.jpg"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Cập nhật profile thành công",
  "data": { ... }
}
```

### 2.3 Đổi mật khẩu
```
PUT /api/auth/change-password
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "currentPassword": "123456",
  "newPassword": "654321",
  "confirmPassword": "654321"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

---

## 📦 3. PRODUCTS - Sản Phẩm

### 3.1 Lấy danh sách sản phẩm (Public)
```
GET /api/products

Query Parameters (tùy chọn):
- page=1
- limit=12
- category=<category_id>
- search=<keyword>
- minPrice=100000
- maxPrice=500000
- sortBy=price_asc|price_desc|newest|name_asc

✅ Kết quả mong đợi:
{
  "success": true,
  "data": {
    "products": [...],
    "totalPages": 5,
    "currentPage": 1
  }
}
```

### 3.2 Lấy chi tiết sản phẩm (Public)
```
GET /api/products/:id

✅ Kết quả mong đợi:
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Áo Thun Nam",
    "description": "...",
    "price": 250000,
    "stock": 100,
    "images": [...],
    "category": {...}
  }
}
```

### 3.3 Tạo sản phẩm (Admin/Staff)
```
POST /api/products
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Áo Thun Nam Premium",
  "description": "Áo thun chất liệu cotton 100%",
  "price": 350000,
  "stock": 50,
  "category": "<category_id>",
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["Trắng", "Đen", "Xanh"],
  "images": ["https://example.com/image.jpg"]
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Tạo sản phẩm thành công",
  "data": { ... }
}
```

### 3.4 Cập nhật sản phẩm (Admin/Staff)
```
PUT /api/products/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Áo Thun Nam VIP",
  "price": 400000,
  "stock": 30
}
```

### 3.5 Xóa sản phẩm (Admin only)
```
DELETE /api/products/:id
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Xóa sản phẩm thành công"
}
```

---

## 📂 4. CATEGORIES - Danh Mục

### 4.1 Lấy danh sách danh mục (Public)
```
GET /api/categories

✅ Kết quả mong đợi:
{
  "success": true,
  "data": [
    { "_id": "...", "name": "Áo Nam", "description": "..." },
    { "_id": "...", "name": "Quần Nam", "description": "..." }
  ]
}
```

### 4.2 Tạo danh mục (Admin)
```
POST /api/categories
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Phụ Kiện",
  "description": "Các loại phụ kiện thời trang"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Tạo danh mục thành công",
  "data": { "_id": "...", "name": "Phụ Kiện" }
}
```

### 4.3 Cập nhật danh mục (Admin)
```
PUT /api/categories/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Phụ Kiện Nam",
  "description": "Phụ kiện cho nam giới"
}
```

### 4.4 Xóa danh mục (Admin)
```
DELETE /api/categories/:id
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Xóa danh mục thành công"
}
```

---

## 🛒 5. ORDERS - Đơn Hàng

### 5.1 Tạo đơn hàng (User)
```
POST /api/orders
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "items": [
    {
      "productId": "<product_id>",
      "quantity": 2,
      "size": "M",
      "color": "Trắng"
    }
  ],
  "shippingAddress": {
    "fullName": "Nguyễn Văn Test",
    "phone": "0123456789",
    "address": "123 Đường ABC, Quận 1, TP.HCM"
  },
  "paymentMethod": "COD",
  "couponCode": "GIAM10"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": { "_id": "...", "status": "PENDING", "finalPrice": 650000 }
}
```

### 5.2 Lấy đơn hàng của tôi (User)
```
GET /api/orders/my
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "data": [
    { "_id": "...", "status": "PENDING", "finalPrice": 650000, ... }
  ]
}
```

### 5.3 Lấy chi tiết đơn hàng
```
GET /api/orders/:id
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "data": {
    "_id": "...",
    "items": [...],
    "totalPrice": 700000,
    "discountAmount": 50000,
    "finalPrice": 650000,
    "status": "PENDING",
    "shippingAddress": {...}
  }
}
```

### 5.4 Lấy tất cả đơn hàng (Admin/Staff)
```
GET /api/orders
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "data": [...]
}
```

### 5.5 Cập nhật trạng thái đơn hàng (Admin/Staff)
```
PUT /api/orders/:id/status
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "status": "CONFIRMED"
}

Trạng thái hợp lệ: PENDING, CONFIRMED, SHIPPED, DELIVERING, ARRIVED, PAID_TO_SHIPPER, COMPLETED, CANCELLED

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": { "status": "CONFIRMED" }
}
```

### 5.6 Hủy đơn hàng (User - chỉ PENDING/CONFIRMED)
```
PUT /api/orders/:id/cancel
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Hủy đơn hàng thành công"
}
```

### 5.7 Xác nhận đã thanh toán cho shipper (User - chỉ ARRIVED)
```
PUT /api/orders/:id/paid-to-shipper
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Bạn đã xác nhận thanh toán cho shipper"
}
```

---

## 🎫 6. COUPONS - Mã Giảm Giá

### 6.1 Validate coupon (Public)
```
POST /api/coupons/validate
Content-Type: application/json

Body:
{
  "code": "GIAM10",
  "orderTotal": 500000
}

✅ Kết quả mong đợi:
{
  "success": true,
  "data": {
    "valid": true,
    "discountAmount": 50000,
    "finalPrice": 450000
  }
}
```

### 6.2 Tạo coupon (Admin)
```
POST /api/coupons
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "code": "GIAM10",
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "minOrderValue": 200000,
  "maxDiscount": 50000,
  "usageLimit": 100,
  "expiresAt": "2026-12-31",
  "isActive": true
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Tạo coupon thành công"
}
```

### 6.3 Lấy danh sách coupon (Admin)
```
GET /api/coupons
Headers: Authorization: Bearer <token>
```

### 6.4 Cập nhật coupon (Admin)
```
PUT /api/coupons/:id
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "isActive": false
}
```

### 6.5 Xóa coupon (Admin)
```
DELETE /api/coupons/:id
Headers: Authorization: Bearer <token>
```

---

## ❤️ 7. WISHLIST - Yêu Thích

### 7.1 Lấy danh sách yêu thích
```
GET /api/wishlist
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "data": [
    { "_id": "...", "product": {...} }
  ]
}
```

### 7.2 Thêm vào yêu thích
```
POST /api/wishlist
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "<product_id>"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Thêm vào wishlist thành công"
}
```

### 7.3 Xóa khỏi yêu thích
```
DELETE /api/wishlist/:productId
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Xóa khỏi wishlist thành công"
}
```

---

## ⭐ 8. REVIEWS - Đánh Giá

### 8.1 Lấy đánh giá theo sản phẩm (Public)
```
GET /api/reviews/product/:productId

✅ Kết quả mong đợi:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "rating": 5,
      "comment": "Sản phẩm rất tốt!",
      "user": { "name": "Nguyễn Văn A" },
      "createdAt": "..."
    }
  ]
}
```

### 8.2 Lấy đánh giá trung bình (Public)
```
GET /api/reviews/product/:productId/average

✅ Kết quả mong đợi:
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalReviews": 25
  }
}
```

### 8.3 Tạo đánh giá (User)
```
POST /api/reviews
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "<product_id>",
  "rating": 5,
  "comment": "Sản phẩm rất tốt, giao hàng nhanh!"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Đánh giá thành công"
}
```

### 8.4 Xóa đánh giá (User/Admin)
```
DELETE /api/reviews/:id
Headers: Authorization: Bearer <token>
```

---

## 💬 9. CHAT - Nhắn Tin

### 9.1 Gửi tin nhắn
```
POST /api/chat/send
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "receiverId": "<admin_user_id>",
  "content": "Xin chào, tôi cần hỗ trợ!"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Gửi tin nhắn thành công",
  "data": { "_id": "...", "content": "...", "createdAt": "..." }
}
```

### 9.2 Lấy tin nhắn với một người
```
GET /api/chat/:userId
Headers: Authorization: Bearer <token>
```

### 9.3 Lấy danh sách cuộc trò chuyện
```
GET /api/chat/conversations/all
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "data": [
    {
      "user": { "_id": "...", "name": "Admin", "role": "ADMIN" },
      "lastMessage": { "content": "...", "createdAt": "..." },
      "unreadCount": 2
    }
  ]
}
```

### 9.4 Lấy danh sách admin/staff để chat
```
GET /api/chat/users/list
Headers: Authorization: Bearer <token>
```

### 9.5 Lấy số tin nhắn chưa đọc
```
GET /api/chat/unread/count
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "data": { "unreadCount": 5 }
}
```

### 9.6 Đánh dấu đã đọc
```
PUT /api/chat/read/:userId
Headers: Authorization: Bearer <token>
```

---

## 💰 10. WITHDRAWALS - Rút Tiền

### 10.1 Lấy số dư
```
GET /api/withdrawals/balance
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
{
  "success": true,
  "data": {
    "totalRevenue": 5000000,
    "totalWithdrawn": 1000000,
    "availableBalance": 4000000
  }
}
```

### 10.2 Tạo yêu cầu rút tiền
```
POST /api/withdrawals
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "amount": 500000,
  "bankName": "Vietcombank",
  "accountNumber": "1234567890",
  "accountHolder": "NGUYEN VAN A"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Yêu cầu rút tiền đã được gửi"
}
```

### 10.3 Lấy danh sách rút tiền của tôi
```
GET /api/withdrawals/my
Headers: Authorization: Bearer <token>
```

### 10.4 Lấy tất cả yêu cầu rút tiền (Admin)
```
GET /api/withdrawals
Headers: Authorization: Bearer <token>
```

### 10.5 Cập nhật trạng thái rút tiền (Admin)
```
PUT /api/withdrawals/:id/status
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "status": "COMPLETED",
  "note": "Đã chuyển khoản thành công"
}

Trạng thái: PENDING, APPROVED, REJECTED, COMPLETED
```

---

## 💳 11. PAYMENT - Thanh Toán

### 11.1 Tạo thanh toán mock
```
POST /api/payment/mock/create
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "orderId": "<order_id>"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "data": {
    "paymentUrl": "/mock-payment?orderId=xxx&amount=xxx",
    "orderId": "xxx",
    "amount": 650000
  }
}
```

### 11.2 Xác nhận thanh toán mock
```
POST /api/payment/mock/confirm
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "orderId": "<order_id>"
}

✅ Kết quả mong đợi:
{
  "success": true,
  "message": "Thanh toán thành công!"
}
```

---

## 📊 12. ADMIN - Thống Kê

### 12.1 Lấy thống kê dashboard (Admin)
```
GET /api/admin/stats
Headers: Authorization: Bearer <token>

✅ Kết quả mong đợi:
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

## 👥 13. USERS - Quản Lý User (Admin)

### 13.1 Lấy danh sách users (Admin)
```
GET /api/users
Headers: Authorization: Bearer <token>
```

### 13.2 Cập nhật vai trò user (Admin)
```
PUT /api/users/:id/role
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "role": "STAFF"
}

Vai trò: USER, STAFF, ADMIN
```

### 13.3 Xóa user (Admin)
```
DELETE /api/users/:id
Headers: Authorization: Bearer <token>
```

---

## ⚠️ Lỗi Thường Gặp

### 401 Unauthorized
- Token hết hạn → Đăng nhập lại
- Token không đúng → Kiểm tra format `Bearer <token>`

### 403 Forbidden
- Không có quyền truy cập endpoint đó
- Ví dụ: User thường gọi API của Admin

### 400 Bad Request
- Thiếu trường bắt buộc
- Email đã tồn tại
- Mật khẩu không đúng

### 404 Not Found
- ID không tồn tại
- Endpoint không đúng

---

**Test thành công! ✅**
