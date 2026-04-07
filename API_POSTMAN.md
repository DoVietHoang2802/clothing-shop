# API Documentation - Clothing Shop

> **Base URL:** `https://clothing-shop-api-8wae.onrender.com/api`
>
> **Header mặc định cho API Private:**
> ```
> Authorization: Bearer <token>
> Content-Type: application/json
> ```

---

## 1. AUTH - Xác thực

### 1.1. Đăng ký tài khoản
```
POST /api/auth/register
```
**Body:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "password": "matkhau123"
}
```
**Response 201 - Thành công:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```
**Response 400 - Email đã tồn tại:**
```json
{ "success": false, "message": "Email đã tồn tại", "data": null }
```

---

### 1.2. Đăng nhập
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "nguyenvana@gmail.com",
  "password": "matkhau123"
}
```
**Response 200 - Thành công:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```
**Response 401 - Sai email/mật khẩu:**
```json
{ "success": false, "message": "Email hoặc mật khẩu không chính xác", "data": null }
```

---

### 1.3. Đăng nhập Google
```
POST /api/auth/google
```
**Body:**
```json
{
  "googleToken": "ya29.a0AfH6SMBx..."
}
```
**Response 200:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "USER" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 1.4. Quên mật khẩu (Đổi mk mới - không cần token cũ)
```
POST /api/auth/forgot-password
```
**Body:**
```json
{
  "email": "haha@gmail.com",
  "name": "haha",
  "newPassword": "haha1234",
  "confirmPassword": "haha1234"
}
```
**Response 200 - ✅ Thành công:**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.",
  "data": null
}
```
**Response 200 - Email/name sai (bảo mật - không tiết lộ):**
```json
{
  "success": true,
  "message": "Nếu email và họ tên hợp lệ, mật khẩu sẽ được đặt lại thành công.",
  "data": null
}
```
**Response 400 - Validation lỗi:**
```json
{ "success": false, "message": "Mật khẩu xác nhận không khớp", "data": null }
```
```json
{ "success": false, "message": "Mật khẩu phải có ít nhất 6 ký tự", "data": null }
```
```json
{ "success": false, "message": "Vui lòng nhập email", "data": null }
```

---

### 1.5. Đổi mật khẩu (cần mật khẩu cũ)
```
POST /api/auth/change-password
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "matkhaucu123",
  "newPassword": "matkhaumoi456",
  "confirmPassword": "matkhaumoi456"
}
```
**Response 200:**
```json
{ "success": true, "message": "Đổi mật khẩu thành công", "data": null }
```
**Response 400:**
```json
{ "success": false, "message": "Mật khẩu cũ không chính xác", "data": null }
```

---

### 1.6. Refresh token
```
POST /api/auth/refresh-token
```
**Body:**
```json
{ "token": "eyJhbGciOiJIUzI1NiIs..." }
```

---

## 2. PRODUCTS - Sản phẩm

### 2.1. Lấy tất cả sản phẩm
```
GET /api/products
```
**Query params (tùy chọn):**
| Param | Ví dụ | Mô tả |
|-------|-------|-------|
| `page` | `1` | Trang |
| `limit` | `12` | Số lượng mỗi trang |
| `search` | `áo phông` | Tìm theo tên |
| `category` | `665f1a2b3c4d5e6f7a8b9c0d` | Lọc theo danh mục |
| `minPrice` | `100000` | Giá tối thiểu |
| `maxPrice` | `500000` | Giá tối đa |
| `sort` | `newest` | Sắp xếp: `newest`, `price_asc`, `price_desc`, `name_asc`, `bestselling` |
| `lowStock` | `true` | Chỉ hiện sản phẩm sắp hết hàng |
| `inStock` | `true` | Chỉ hiện sản phẩm còn hàng |

**Response 200:**
```json
{
  "success": true,
  "data": [/* array sản phẩm */],
  "pagination": {
    "currentPage": 1,
    "pageSize": 12,
    "total": 48,
    "totalPages": 4
  }
}
```

---

### 2.2. Lấy 1 sản phẩm
```
GET /api/products/:id
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Áo Phông Nam Trơn",
    "price": 250000,
    "stock": 45,
    "category": { "_id": "...", "name": "Áo Nam" },
    "images": ["data:image/jpeg;base64,..."],
    "description": "Chất liệu cotton 100%...",
    "averageRating": 4.5,
    "reviewCount": 12
  }
}
```

---

### 2.3. Tạo sản phẩm (ADMIN/STAFF)
```
POST /api/products
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Áo Phông Nữ Caro",
  "price": 299000,
  "stock": 50,
  "categoryId": "665f1a2b3c4d5e6f7a8b9c0d",
  "description": "Áo phông nữ chất liệu vải thoáng mát"
}
```
**Response 201:**
```json
{ "success": true, "message": "Tạo sản phẩm thành công", "data": {/* sản phẩm */} }
```

---

### 2.4. Upload ảnh sản phẩm (ADMIN/STAFF)
```
POST /api/products/upload
```
**Header:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Body:** `image` (file ảnh)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/products/image-665f1a2b3c4d.jpg"
  }
}
```

---

### 2.5. Cập nhật sản phẩm (ADMIN/STAFF)
```
PUT /api/products/:id
```
**Header:** `Authorization: Bearer <token>`

**Body:** giống create (các trường muốn sửa)

---

### 2.6. Xóa sản phẩm (ADMIN)
```
DELETE /api/products/:id
```
**Header:** `Authorization: Bearer <token>`

---

## 3. CATEGORIES - Danh mục

### 3.1. Lấy tất cả danh mục (PUBLIC)
```
GET /api/categories
```
**Response 200:**
```json
{
  "success": true,
  "data": [
    { "_id": "665f1a2b3c4d5e6f7a8b9c0d", "name": "Áo Nam" },
    { "_id": "665f1a2b3c4d5e6f7a8b9c0e", "name": "Áo Nữ" },
    { "_id": "665f1a2b3c4d5e6f7a8b9c0f", "name": "Quần Nam" }
  ]
}
```

### 3.2. Tạo danh mục (ADMIN)
```
POST /api/categories
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{ "name": "Giày Dép" }
```

### 3.3. Cập nhật danh mục (ADMIN)
```
PUT /api/categories/:id
```
**Body:**
```json
{ "name": "Giày Thể Thao" }
```

### 3.4. Xóa danh mục (ADMIN)
```
DELETE /api/categories/:id
```

---

## 4. ORDERS - Đơn hàng

### 4.1. Tạo đơn hàng
```
POST /api/orders
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "items": [
    { "productId": "665f1a2b3c4d5e6f7a8b9c0d", "quantity": 2 }
  ],
  "couponCode": "GIAM10",
  "paymentMethod": "COD",
  "shippingAddress": {
    "fullName": "Nguyễn Văn A",
    "phone": "0909123456",
    "address": "123 Nguyễn Trãi, Quận 1, TP.HCM"
  }
}
```
**Response 201:**
```json
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "orderId": "ORD-665f1a2b",
    "totalPrice": 500000,
    "status": "PENDING"
  }
}
```

---

### 4.2. Lấy đơn hàng của tôi
```
GET /api/orders/my
```
**Header:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": [/* array đơn hàng */],
  "pagination": { "currentPage": 1, "pageSize": 10, "total": 3, "totalPages": 1 }
}
```

---

### 4.3. Lấy chi tiết đơn hàng
```
GET /api/orders/:id
```
**Header:** `Authorization: Bearer <token>`

---

### 4.4. Hủy đơn hàng
```
PUT /api/orders/:id/cancel
```
**Header:** `Authorization: Bearer <token>`

**Response 200:**
```json
{ "success": true, "message": "Hủy đơn hàng thành công", "data": null }
```

---

### 4.5. Xác nhận đã nhận hàng (MOMO)
```
PUT /api/orders/:id/received
```
**Header:** `Authorization: Bearer <token>`

---

### 4.6. Xác nhận đã thanh toán shipper (COD)
```
PUT /api/orders/:id/paid-to-shipper
```
**Header:** `Authorization: Bearer <token>`

---

### 4.7. Lấy tất cả đơn hàng (ADMIN/STAFF)
```
GET /api/orders
```
**Header:** `Authorization: Bearer <token>`

---

### 4.8. Cập nhật trạng thái đơn hàng (ADMIN/STAFF)
```
PUT /api/orders/:id/status
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{ "status": "SHIPPING" }
```
**Các status hợp lệ:** `PENDING`, `CONFIRMED`, `SHIPPING`, `DELIVERED`, `CANCELLED`, `REFUNDED`

---

### 4.9. Xóa đơn hàng (USER/STAFF)
```
DELETE /api/orders/:id
```
**Header:** `Authorization: Bearer <token>`

---

## 5. USERS - Người dùng

### 5.1. Lấy profile của tôi
```
GET /api/users/profile
```
**Header:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com",
    "role": "USER",
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 5.2. Cập nhật profile
```
PUT /api/users/profile
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Nguyễn Văn B"
}
```

---

### 5.3. Lấy tất cả users (ADMIN)
```
GET /api/users
```
**Header:** `Authorization: Bearer <token>`

---

### 5.4. Xóa user (ADMIN)
```
DELETE /api/users/:id
```

---

### 5.5. Đổi vai trò user (ADMIN)
```
PUT /api/users/:id/role
```
**Body:**
```json
{ "role": "STAFF" }
```
**Các role:** `USER`, `STAFF`, `ADMIN`

---

## 6. ADDRESSES - Địa chỉ

### 6.1. Lấy danh sách địa chỉ
```
GET /api/addresses
```
**Header:** `Authorization: Bearer <token>`

---

### 6.2. Thêm địa chỉ mới
```
POST /api/addresses
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "phone": "0909123456",
  "address": "123 Nguyễn Trãi, Quận 1",
  "city": "TP.HCM",
  "isDefault": false
}
```

---

### 6.3. Cập nhật địa chỉ
```
PUT /api/addresses/:id
```

### 6.4. Xóa địa chỉ
```
DELETE /api/addresses/:id
```

### 6.5. Đặt làm địa chỉ mặc định
```
PUT /api/addresses/:id/default
```

---

## 7. WISHLIST - Yêu thích

### 7.1. Lấy wishlist
```
GET /api/wishlist
```
**Header:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "product": { "_id": "...", "name": "...", "price": 250000, "images": [...] } }
  ]
}
```

---

### 7.2. Thêm vào wishlist
```
POST /api/wishlist
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{ "productId": "665f1a2b3c4d5e6f7a8b9c0d" }
```

---

### 7.3. Xóa khỏi wishlist
```
DELETE /api/wishlist/:productId
```

---

### 7.4. Kiểm tra sản phẩm có trong wishlist
```
GET /api/wishlist/check/:productId
```

---

## 8. REVIEWS - Đánh giá

### 8.1. Lấy reviews sản phẩm
```
GET /api/reviews/product/:productId
```
**Query params:** `page`, `limit`

**Response 200:**
```json
{
  "success": true,
  "data": [/* array reviews */],
  "pagination": { "currentPage": 1, "pageSize": 5, "total": 12, "totalPages": 3 }
}
```

---

### 8.2. Lấy điểm đánh giá trung bình
```
GET /api/reviews/product/:productId/average
```
**Response 200:**
```json
{ "success": true, "data": { "averageRating": 4.5, "reviewCount": 12 } }
```

---

### 8.3. Tạo review
```
POST /api/reviews
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "productId": "665f1a2b3c4d5e6f7a8b9c0d",
  "rating": 5,
  "comment": "Sản phẩm rất tốt, giao hàng nhanh!"
}
```

---

### 8.4. Sửa review
```
PUT /api/reviews/:id
```
**Body:**
```json
{ "rating": 4, "comment": "Sản phẩm tốt" }
```

---

### 8.5. Xóa review
```
DELETE /api/reviews/:id
```

---

## 9. COUPONS - Mã giảm giá

### 9.1. Xác nhận/áp dụng coupon (PUBLIC)
```
POST /api/coupons/validate
```
**Body:**
```json
{
  "code": "GIAM10",
  "orderTotal": 500000
}
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "code": "GIAM10",
    "type": "percentage",
    "value": 10,
    "minOrderValue": 200000,
    "maxDiscount": 50000,
    "discountAmount": 50000,
    "finalTotal": 450000
  }
}
```
**Response 400 - Coupon hết hạn/sai:**
```json
{ "success": false, "message": "Mã coupon không hợp lệ hoặc đã hết hạn", "data": null }
```

---

### 9.2. Lấy danh sách coupon (ADMIN)
```
GET /api/coupons
```
**Header:** `Authorization: Bearer <token>`

---

### 9.3. Tạo coupon (ADMIN)
```
POST /api/coupons
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "code": "SUMMER50",
  "type": "percentage",
  "value": 50,
  "minOrderValue": 300000,
  "maxDiscount": 100000,
  "usageLimit": 100,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```
**Type hợp lệ:** `percentage`, `fixed`

---

### 9.4. Cập nhật coupon (ADMIN)
```
PUT /api/coupons/:id
```

### 9.5. Xóa coupon (ADMIN)
```
DELETE /api/coupons/:id
```

---

## 10. NOTIFICATIONS - Thông báo

### 10.1. Lấy tất cả thông báo
```
GET /api/notifications
```
**Header:** `Authorization: Bearer <token>`

**Query params:** `page`, `limit`, `unreadOnly=true`

---

### 10.2. Số thông báo chưa đọc
```
GET /api/notifications/unread-count
```
**Response 200:**
```json
{ "success": true, "data": { "count": 3 } }
```

---

### 10.3. Đánh dấu đã đọc 1 thông báo
```
PUT /api/notifications/:id/read
```

---

### 10.4. Đánh dấu đã đọc tất cả
```
PUT /api/notifications/read-all
```

---

### 10.5. Xóa thông báo đã đọc
```
DELETE /api/notifications/read
```

---

### 10.6. Xóa 1 thông báo
```
DELETE /api/notifications/:id
```

---

## 11. PAYMENT MoMo - Thanh toán MoMo

### 11.1. Tạo thanh toán MoMo
```
POST /api/momo/create
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "orderId": "665f1a2b3c4d5e6f7a8b9c0d",
  "amount": 500000
}
```
**Response 200:**
```json
{
  "success": true,
  "data": {
    "payUrl": "https://test-payment.momo.vn/...",
    "orderId": "MOMO665f1a2b"
  }
}
```

---

### 11.2. Kiểm tra giao dịch MoMo
```
GET /api/momo/query/:orderId
```

---

## 12. ADMIN DASHBOARD

### 12.1. Lấy thống kê dashboard
```
GET /api/admin/stats
```
**Header:** `Authorization: Bearer <token>` (ADMIN)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 125,
    "totalOrders": 342,
    "totalRevenue": 85650000,
    "pendingOrders": 12,
    "lowStockProducts": 5
  }
}
```

---

### 12.2. Lấy dữ liệu biểu đồ
```
GET /api/admin/stats/chart
```
**Header:** `Authorization: Bearer <token>` (ADMIN)

**Query params:** `period=weekly` (hoặc `monthly`, `yearly`)

---

## 13. CHAT - Nhắn tin

### 13.1. Lấy danh sách cuộc trò chuyện
```
GET /api/chat/conversations/all
```
**Header:** `Authorization: Bearer <token>`

---

### 13.2. Lấy danh sách admin/staff để chat
```
GET /api/chat/users/list
```

---

### 13.3. Lấy tin nhắn với 1 người
```
GET /api/chat/:userId
```

---

### 13.4. Gửi tin nhắn
```
POST /api/chat/send
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "receiverId": "665f1a2b3c4d5e6f7a8b9c0d",
  "message": "Xin chào, tôi cần hỗ trợ"
}
```

---

### 13.5. Đánh dấu đã đọc tin nhắn
```
PUT /api/chat/read/:userId
```

---

### 13.6. Số tin nhắn chưa đọc
```
GET /api/chat/unread/count
```

---

### 13.7. Xóa tin nhắn
```
DELETE /api/chat/message/:id
```

---

### 13.8. Xóa cuộc trò chuyện
```
DELETE /api/chat/conversation/:userId
```

---

## 14. SSE - Real-time (Events)

> SSE dùng để server tự động gửi dữ liệu tới trình duyệt **không cần client gửi request**. Ví dụ: thông báo mới, đơn hàng thay đổi.

### 14.1. SSE nhận cập nhật đơn hàng
```
GET /api/orders/sse
```
**Header:** `Authorization: Bearer <token>`
**Kiểu:** SSE (text/event-stream)
**Không dùng Postman test được** — dùng trình duyệt hoặc code:

```javascript
// Ví dụ trong trình duyệt console:
const es = new EventSource('http://localhost:5000/api/orders/sse', {
  headers: { Authorization: 'Bearer ' + token }
});
es.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Order update:', data);
};
```

### 14.2. SSE nhận tin nhắn chat
```
GET /api/chat/sse
```
**Header:** `Authorization: Bearer <token>`
