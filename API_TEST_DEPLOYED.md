# 📋 Hướng Dẫn Test API - Deployed

**Base URL:** `https://clothing-shop-api-8wae.onrender.com/api`

**Frontend URL:** `https://clothing-shop-ashy.vercel.app`

**Tools:** Postman, Thunder Client, hoặc cURL

---

## 🔐 1. AUTH - Xác Thực

### 1.1 Đăng ký tài khoản
```
POST /api/auth/register
Content-Type: application/json

Body:
{
  "name": "Nguyễn Văn Demo",
  "email": "demo@deployed.com",
  "password": "123456"
}

✅ Test: Thành công
❌ Lỗi: Email đã tồn tại (409 Conflict)
```

### 1.2 Đăng nhập
```
POST /api/auth/login
Content-Type: application/json

Body:
{
  "email": "demo@deployed.com",
  "password": "123456"
}

✅ Test: Thành công - Nhận được token
❌ Lỗi: Email hoặc mật khẩu không đúng (401)
```

### 1.3 Quên mật khẩu
```
POST /api/auth/forgot-password
Content-Type: application/json

Body:
{
  "email": "demo@deployed.com"
}
```

### 1.4 Health Check
```
GET /api/health

✅ Kết quả:
{
  "success": true,
  "message": "Server is running"
}
```

---

## 👤 2. USER - Người Dùng

### 2.1 Lấy thông tin profile
```
GET /api/users/profile
Headers: Authorization: Bearer <token>

✅ Test: Lấy được thông tin user hiện tại
```

### 2.2 Cập nhật profile
```
PUT /api/users/profile
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Tên Mới Updated",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

## 📦 3. PRODUCTS - Sản Phẩm

### 3.1 Lấy danh sách sản phẩm (Public)
```
GET /api/products

✅ Test: Lấy được danh sách sản phẩm với phân trang
```

### 3.2 Lấy chi tiết sản phẩm (Public)
```
GET /api/products/:id

✅ Test: Lấy được chi tiết sản phẩm
❌ Lỗi: Sản phẩm không tồn tại (404)
```

### 3.3 Tìm kiếm sản phẩm
```
GET /api/products?search=áo&category=<id>&sortBy=price_asc

✅ Test: Lọc và sắp xếp theo yêu cầu
```

### 3.4 Tạo sản phẩm (Admin/Staff)
```
POST /api/products
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Sản Phẩm Mới",
  "description": "Mô tả sản phẩm",
  "price": 299000,
  "stock": 100,
  "category": "<category_id>"
}

✅ Test: Tạo thành công
❌ Lỗi: Không có quyền (403)
```

### 3.5 Upload ảnh sản phẩm
```
POST /api/products/upload
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- image: <file>

✅ Test: Upload thành công, nhận URL ảnh
```

---

## 📂 4. CATEGORIES - Danh Mục

### 4.1 Lấy danh sách danh mục (Public)
```
GET /api/categories

✅ Test: Lấy được tất cả danh mục
```

### 4.2 Tạo danh mục (Admin)
```
POST /api/categories
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "name": "Danh Mục Mới",
  "description": "Mô tả danh mục"
}

✅ Test: Tạo thành công
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
      "quantity": 1,
      "size": "M",
      "color": "Đen"
    }
  ],
  "shippingAddress": {
    "fullName": "Nguyễn Văn Demo",
    "phone": "0909123456",
    "address": "123 Đường Test, Quận 1, TP.HCM"
  },
  "paymentMethod": "COD"
}

✅ Test: Tạo đơn hàng thành công, stock giảm
❌ Lỗi: Sản phẩm hết hàng (400)
```

### 5.2 Lấy đơn hàng của tôi (User)
```
GET /api/orders/my
Headers: Authorization: Bearer <token>

✅ Test: Lấy danh sách đơn hàng của user đó
```

### 5.3 Cập nhật trạng thái đơn hàng (Admin/Staff)
```
PUT /api/orders/:id/status
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "status": "CONFIRMED"
}

✅ Test: Cập nhật thành công, stock không đổi
```

### 5.4 Hủy đơn hàng (User)
```
PUT /api/orders/:id/cancel
Headers: Authorization: Bearer <token>

✅ Test: Hủy thành công, stock được restore
❌ Lỗi: Đơn đang giao, không thể hủy (400)
```

---

## 🎫 6. COUPONS - Mã Giảm Giá

### 6.1 Validate coupon
```
POST /api/coupons/validate
Content-Type: application/json

Body:
{
  "code": "SUMMER2024",
  "orderTotal": 500000
}

✅ Test: Coupon hợp lệ, tính được giảm giá
❌ Lỗi: Coupon không tồn tại hoặc đã hết hạn
```

### 6.2 Áp dụng coupon khi tạo đơn
```
POST /api/orders
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "items": [...],
  "shippingAddress": {...},
  "paymentMethod": "COD",
  "couponCode": "SUMMER2024"
}

✅ Test: Giảm giá được áp dụng vào finalPrice
```

---

## ❤️ 7. WISHLIST - Yêu Thích

### 7.1 Thêm vào wishlist
```
POST /api/wishlist
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "<product_id>"
}

✅ Test: Thêm thành công
❌ Lỗi: Đã có trong wishlist
```

### 7.2 Lấy danh sách wishlist
```
GET /api/wishlist
Headers: Authorization: Bearer <token>

✅ Test: Lấy được danh sách sản phẩm yêu thích
```

---

## ⭐ 8. REVIEWS - Đánh Giá

### 8.1 Đánh giá sản phẩm (User đã mua)
```
POST /api/reviews
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "productId": "<product_id>",
  "rating": 5,
  "comment": "Sản phẩm rất tốt!"
}

✅ Test: Đánh giá được tạo
❌ Lỗi: Đã đánh giá sản phẩm này rồi
```

### 8.2 Xem đánh giá sản phẩm (Public)
```
GET /api/reviews/product/:productId

✅ Test: Xem được danh sách đánh giá
```

---

## 💬 9. CHAT - Nhắn Tin

### 9.1 Lấy danh sách admin/staff để chat
```
GET /api/chat/users/list
Headers: Authorization: Bearer <token>

✅ Test: Lấy được danh sách admin/staff
```

### 9.2 Gửi tin nhắn
```
POST /api/chat/send
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "receiverId": "<admin_id>",
  "content": "Xin chào, tôi cần hỗ trợ!"
}

✅ Test: Tin nhắn được gửi thành công
```

### 9.3 Lấy cuộc trò chuyện
```
GET /api/chat/:userId
Headers: Authorization: Bearer <token>

✅ Test: Lấy được lịch sử tin nhắn
```

---

## 💰 10. WITHDRAWALS - Rút Tiền

### 10.1 Lấy số dư
```
GET /api/withdrawals/balance
Headers: Authorization: Bearer <token>

✅ Test: Lấy được số dư khả dụng
```

### 10.2 Tạo yêu cầu rút tiền
```
POST /api/withdrawals
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "amount": 100000,
  "bankName": "Vietcombank",
  "accountNumber": "1234567890",
  "accountHolder": "NGUYEN VAN DEMO"
}

✅ Test: Tạo yêu cầu thành công
❌ Lỗi: Số dư không đủ
```

---

## 💳 11. PAYMENT - Thanh Toán

### 11.1 Thanh toán COD
```
POST /api/orders
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "items": [...],
  "shippingAddress": {...},
  "paymentMethod": "COD"
}

✅ Test: Tạo đơn hàng COD thành công
```

### 11.2 Mock VNPay Payment
```
POST /api/payment/mock/create
Headers: Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "orderId": "<order_id>"
}

✅ Test: Tạo link thanh toán mock
```

---

## 📊 12. ADMIN - Thống Kê

### 12.1 Lấy thống kê (Admin)
```
GET /api/admin/stats
Headers: Authorization: Bearer <token>

✅ Test: Lấy được tất cả số liệu thống kê
```

### 12.2 Lấy chart data (Admin)
```
GET /api/admin/chart-data
Headers: Authorization: Bearer <token>

✅ Test: Lấy được dữ liệu biểu đồ
```

---

## 🔄 Test Flow Hoàn Chỉnh

### Flow 1: User mua hàng
```
1. POST /api/auth/register     → Tạo tài khoản
2. POST /api/auth/login        → Đăng nhập, lấy token
3. GET /api/products           → Xem sản phẩm
4. POST /api/orders            → Tạo đơn hàng (COD)
5. GET /api/orders/my         → Xem đơn hàng
6. PUT /api/orders/:id/cancel → Hủy đơn (nếu cần)
```

### Flow 2: Admin quản lý đơn hàng
```
1. POST /api/auth/login        → Đăng nhập admin
2. GET /api/orders             → Xem tất cả đơn
3. PUT /api/orders/:id/status  → Cập nhật trạng thái
4. GET /api/admin/stats        → Xem thống kê
```

### Flow 3: Coupon
```
1. POST /api/auth/login        → Đăng nhập
2. POST /api/coupons/validate  → Kiểm tra coupon
3. POST /api/orders            → Tạo đơn với coupon
```

---

## ⚠️ Lỗi Thường Gặp

| Lỗi | Nguyên nhân | Giải pháp |
|------|-------------|------------|
| 401 | Token hết hạn | Đăng nhập lại |
| 403 | Không có quyền | Kiểm tra role |
| 400 | Thiếu trường | Kiểm tra body request |
| 404 | Không tìm thấy | Kiểm tra ID |
| 500 | Server error | Liên hệ admin |

---

## 📱 Test Trên Postman

### Import Collection
1. Tạo Collection mới: "Clothing Shop API"
2. Thêm Environment:
   - `baseUrl`: `https://clothing-shop-api-8wae.onrender.com/api`
   - `token`: (lưu sau khi login)

### Test các API theo thứ tự:
1. Health check
2. Register
3. Login → Lưu token vào environment
4. Get Profile (dùng token)
5. Get Products
6. Create Order
7. Get My Orders

---

## ✅ Checklist Test

- [ ] Health check hoạt động
- [ ] Register/Login hoạt động
- [ ] JWT token được tạo
- [ ] Protected routes yêu cầu token
- [ ] Products CRUD hoạt động
- [ ] Orders CRUD hoạt động
- [ ] Coupon validate hoạt động
- [ ] Chat hoạt động
- [ ] Admin stats hoạt động

---

**Test thành công! ✅**
