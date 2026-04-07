# API Documentation - Clothing Shop

> **Base URL:** `https://clothing-shop-api-8wae.onrender.com/api`
>
> **Header cho API cần đăng nhập:**
> ```
> Authorization: Bearer <token>
> Content-Type: application/json
> ```
>
> **Cách lấy token:** Gọi `POST /api/auth/login` → copy `data.token` từ response.

---

## 1. AUTH - Xác thực

### 1.1. Đăng ký
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
**Response 201:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": { "id": "...", "name": "Nguyễn Văn A", "email": "nguyenvana@gmail.com", "role": "USER" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```
**Lỗi 400:** `{ "success": false, "message": "Email đã tồn tại", "data": null }`

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
**Response 200:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": { "id": "...", "name": "Nguyễn Văn A", "email": "nguyenvana@gmail.com", "role": "USER" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```
**Lỗi 401:** `{ "success": false, "message": "Email hoặc mật khẩu không chính xác", "data": null }`

---

### 1.3. Quên mật khẩu (Đổi mật khẩu mới)
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
**Response 200 ✅:**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.",
  "data": null
}
```
**Response 200 (email/name sai - không tiết lộ):**
```json
{
  "success": true,
  "message": "Nếu email và họ tên hợp lệ, mật khẩu sẽ được đặt lại thành công.",
  "data": null
}
```
**Lỗi 400:**
```json
{ "success": false, "message": "Mật khẩu xác nhận không khớp", "data": null }
{ "success": false, "message": "Mật khẩu phải có ít nhất 6 ký tự", "data": null }
{ "success": false, "message": "Vui lòng nhập email", "data": null }
```

---

### 1.4. Đổi mật khẩu (cần mật khẩu cũ)
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
**Response 200:** `{ "success": true, "message": "Đổi mật khẩu thành công", "data": null }`
**Lỗi 400:** `{ "success": false, "message": "Mật khẩu cũ không chính xác", "data": null }`

---

## 2. PRODUCTS - Sản phẩm

### 2.1. Lấy danh sách sản phẩm
```
GET /api/products
```
**Query params (tùy chọn):**
| Param | Ví dụ | Mô tả |
|-------|--------|-------|
| `page` | `1` | Trang |
| `limit` | `12` | Số lượng mỗi trang |
| `search` | `áo phông` | Tìm theo tên |
| `category` | `id-danh-muc` | Lọc theo danh mục |
| `minPrice` | `100000` | Giá tối thiểu |
| `maxPrice` | `500000` | Giá tối đa |
| `sort` | `newest` | `newest`, `price_asc`, `price_desc`, `name_asc`, `bestselling` |
| `lowStock` | `true` | Sản phẩm sắp hết hàng |
| `inStock` | `true` | Chỉ sản phẩm còn hàng |

**Response 200:**
```json
{
  "success": true,
  "data": [/* array sản phẩm */],
  "pagination": { "currentPage": 1, "pageSize": 12, "total": 48, "totalPages": 4 }
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
    "_id": "...",
    "name": "Áo Phông Nam Trơn",
    "price": 250000,
    "stock": 45,
    "category": { "_id": "...", "name": "Áo Nam" },
    "images": ["..."],
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
  "categoryId": "id-danh-muc",
  "description": "Áo phông nữ chất liệu vải thoáng mát"
}
```

---

### 2.4. Upload ảnh sản phẩm (ADMIN/STAFF)
```
POST /api/products/upload
```
**Header:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Body:** Chọn file ảnh gửi lên với key là `image`

**Response 200:**
```json
{ "success": true, "data": { "url": "/uploads/products/image-xxx.jpg" } }
```

---

### 2.5. Cập nhật sản phẩm (ADMIN/STAFF)
```
PUT /api/products/:id
```
**Header:** `Authorization: Bearer <token>`

**Body:** các trường muốn sửa (name, price, stock, categoryId, description, images)

---

### 2.6. Xóa sản phẩm (ADMIN)
```
DELETE /api/products/:id
```
**Header:** `Authorization: Bearer <token>`

---

## 3. CATEGORIES - Danh mục

### 3.1. Lấy tất cả danh mục
```
GET /api/categories
```
**Response 200:**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "name": "Áo Nam" },
    { "_id": "...", "name": "Áo Nữ" }
  ]
}
```

---

### 3.2. Tạo danh mục (ADMIN)
```
POST /api/categories
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{ "name": "Giày Dép" }
```

---

### 3.3. Cập nhật danh mục (ADMIN)
```
PUT /api/categories/:id
```
**Body:**
```json
{ "name": "Giày Thể Thao" }
```

---

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
    { "productId": "id-san-pham-1", "quantity": 2 },
    { "productId": "id-san-pham-2", "quantity": 1 }
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
**paymentMethod:** `COD` (nhận hàng rồi trả tiền) hoặc `MOMO` (thanh toán MoMo online)

**Response 201:**
```json
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "_id": "...",
    "orderId": "ORD-xxx",
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

### 4.3. Lấy chi tiết 1 đơn hàng
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

**Response 200:** `{ "success": true, "message": "Hủy đơn hàng thành công", "data": null }`

---

### 4.5. Xác nhận đã nhận hàng (MOMO)
```
PUT /api/orders/:id/received
```
**Header:** `Authorization: Bearer <token>`

---

### 4.6. Xác nhận đã thanh toán cho shipper (COD)
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
**Body:**
```json
{ "status": "SHIPPING" }
```
**Các status:** `PENDING` → `CONFIRMED` → `SHIPPING` → `DELIVERED`
<br>Còn `CANCELLED` (hủy), `REFUNDED` (hoàn tiền)

---

### 4.9. Xóa đơn hàng (USER/STAFF)
```
DELETE /api/orders/:id
```

---

## 5. USERS - Người dùng

### 5.1. Lấy profile của tôi
```
GET /api/users/profile
```
**Header:** `Authorization: Bearer <token>`

---

### 5.2. Cập nhật profile
```
PUT /api/users/profile
```
**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{ "name": "Nguyễn Văn B" }
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
  "isDefault": true
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

---

### 7.2. Thêm vào wishlist
```
POST /api/wishlist
```
**Body:**
```json
{ "productId": "id-san-pham" }
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

---

### 8.2. Lấy điểm đánh giá trung bình sản phẩm
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
  "productId": "id-san-pham",
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

### 9.1. Áp dụng / kiểm tra coupon (PUBLIC)
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
**Lỗi 400:** `{ "success": false, "message": "Mã coupon không hợp lệ hoặc đã hết hạn", "data": null }`

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
`type`: `percentage` (%) hoặc `fixed` (VND)

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
**Response 200:** `{ "success": true, "data": { "count": 3 } }`

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

## Tổng kết nhanh

| Nhóm | API | Mức |
|------|-----|-----|
| **Auth** | register, login, forgot-password, change-password | Public + Private |
| **Products** | get all, get one, create, upload image, update, delete | Public + Private |
| **Categories** | get all, create, update, delete | Public + Private |
| **Orders** | create, my orders, detail, cancel, received, paid-to-shipper, all orders, update status, delete | Private |
| **Users** | profile, update profile, all users, delete, update role | Private |
| **Addresses** | CRUD địa chỉ | Private |
| **Wishlist** | get, add, remove, check | Private |
| **Reviews** | get reviews, average, create, update, delete | Public + Private |
| **Coupons** | validate, CRUD coupon | Public + Private |
| **Notifications** | get, unread count, mark read, delete | Private |

**Phân quyền:**
- `USER` → Khách hàng thường
- `STAFF` → Nhân viên (quản lý đơn hàng, sản phẩm)
- `ADMIN` → Quản trị viên (toàn quyền)
