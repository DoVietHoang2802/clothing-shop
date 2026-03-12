# 📚 API Documentation - Clothing Shop

## Base URL
```
http://localhost:5000/api
```

---

## 🔑 Authentication

### Login
**POST** `/auth/login`

Đăng nhập và nhận JWT token.

```json
Request:
{
  "email": "user@test.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Tên User",
      "email": "user@test.com",
      "role": "USER"
    }
  }
}
```

---

### Register
**POST** `/auth/register`

Đăng ký tài khoản mới.

```json
Request:
{
  "name": "Tên Người Dùng",
  "email": "newemail@test.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Tên Người Dùng",
      "email": "newemail@test.com",
      "role": "USER"
    }
  }
}
```

---

## 📂 Categories API

### Get All Categories
**GET** `/categories`

Lấy danh sách tất cả danh mục (Public).

```json
Response:
{
  "success": true,
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Áo",
      "description": "Danh mục áo trang phục",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Quần",
      "description": "Danh mục quần trang phục",
      "createdAt": "2024-01-15T10:32:00Z"
    }
  ]
}
```

---

### Create Category
**POST** `/categories`

Tạo danh mục mới (ADMIN only).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Request:
{
  "name": "Giày",
  "description": "Danh mục giày trang phục"
}

Response:
{
  "success": true,
  "message": "Tạo danh mục thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Giày",
    "description": "Danh mục giày trang phục",
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### Update Category
**PUT** `/categories/:id`

Cập nhật danh mục (ADMIN only).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Request:
{
  "name": "Giày Thể Thao",
  "description": "Danh mục giày thể thao"
}

Response:
{
  "success": true,
  "message": "Cập nhật danh mục thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Giày Thể Thao",
    "description": "Danh mục giày thể thao",
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### Delete Category
**DELETE** `/categories/:id`

Xóa danh mục (ADMIN only).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response:
{
  "success": true,
  "message": "Xóa danh mục thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Giày Thể Thao",
    "description": "Danh mục giày thể thao",
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

---

## 📦 Products API

### Get All Products
**GET** `/products`

Lấy danh sách tất cả sản phẩm (Public).

**Query Parameters:**
- `category` - Filter theo ID danh mục
- `search` - Tìm kiếm theo tên

```json
Response:
{
  "success": true,
  "message": "Lấy danh sách sản phẩm thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Áo T-Shirt Trắng",
      "description": "Áo t-shirt cotton 100%",
      "price": 150000,
      "stock": 50,
      "image": "https://example.com/image.jpg",
      "category": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-15T10:40:00Z"
    }
  ]
}
```

---

### Get Product Detail
**GET** `/products/:id`

Xem chi tiết sản phẩm (Public).

```json
Response:
{
  "success": true,
  "message": "Lấy chi tiết sản phẩm thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Áo T-Shirt Trắng",
    "description": "Áo t-shirt cotton 100%",
    "price": 150000,
    "stock": 50,
    "image": "https://example.com/image.jpg",
    "category": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Áo",
      "description": "Danh mục áo trang phục"
    },
    "createdAt": "2024-01-15T10:40:00Z"
  }
}
```

---

### Create Product
**POST** `/products`

Tạo sản phẩm mới (STAFF, ADMIN).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Request:
{
  "name": "Áo T-Shirt Đỏ",
  "description": "Áo t-shirt cotton 100% màu đỏ",
  "price": 180000,
  "stock": 30,
  "image": "https://example.com/red-tshirt.jpg",
  "category": "507f1f77bcf86cd799439011"
}

Response:
{
  "success": true,
  "message": "Tạo sản phẩm thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "name": "Áo T-Shirt Đỏ",
    "description": "Áo t-shirt cotton 100% màu đỏ",
    "price": 180000,
    "stock": 30,
    "image": "https://example.com/red-tshirt.jpg",
    "category": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-15T10:45:00Z"
  }
}
```

---

### Update Product
**PUT** `/products/:id`

Cập nhật sản phẩm (STAFF, ADMIN).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Request:
{
  "price": 170000,
  "stock": 35
}

Response:
{
  "success": true,
  "message": "Cập nhật sản phẩm thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "name": "Áo T-Shirt Đỏ",
    "description": "Áo t-shirt cotton 100% màu đỏ",
    "price": 170000,
    "stock": 35,
    "image": "https://example.com/red-tshirt.jpg",
    "category": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-15T10:45:00Z"
  }
}
```

---

### Delete Product
**DELETE** `/products/:id`

Xóa sản phẩm (STAFF, ADMIN).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response:
{
  "success": true,
  "message": "Xóa sản phẩm thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "name": "Áo T-Shirt Đỏ"
  }
}
```

---

## 👥 Users API

### Get All Users
**GET** `/users`

Lấy danh sách tất cả người dùng (ADMIN only).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response:
{
  "success": true,
  "message": "Lấy danh sách người dùng thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439001",
      "name": "Admin User",
      "email": "admin@test.com",
      "role": "ADMIN",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### Get Current User
**GET** `/users/me`

Lấy thông tin người dùng hiện tại (Protected).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response:
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439002",
    "name": "User Name",
    "email": "user@test.com",
    "role": "USER",
    "createdAt": "2024-01-15T10:05:00Z"
  }
}
```

---

### Delete User
**DELETE** `/users/:id`

Xóa người dùng (ADMIN only).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response:
{
  "success": true,
  "message": "Xóa người dùng thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439003",
    "name": "User To Delete",
    "email": "delete@test.com"
  }
}
```

---

## 🛒 Orders API

### Get All Orders
**GET** `/orders`

Lấy danh sách đơn hàng:
- USER: Chỉ xem đơn hàng của mình
- ADMIN/STAFF: Xem tất cả đơn hàng

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response:
{
  "success": true,
  "message": "Lấy danh sách đơn hàng thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "user": "507f1f77bcf86cd799439002",
      "items": [
        {
          "product": "507f1f77bcf86cd799439020",
          "quantity": 2,
          "price": 150000
        }
      ],
      "totalPrice": 300000,
      "status": "PENDING",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

### Create Order
**POST** `/orders`

Tạo đơn hàng mới (Protected).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Request:
{
  "items": [
    {
      "product": "507f1f77bcf86cd799439020",
      "quantity": 2,
      "price": 150000
    }
  ],
  "totalPrice": 300000
}

Response:
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439031",
    "user": "507f1f77bcf86cd799439002",
    "items": [
      {
        "product": "507f1f77bcf86cd799439020",
        "quantity": 2,
        "price": 150000
      }
    ],
    "totalPrice": 300000,
    "status": "PENDING",
    "createdAt": "2024-01-15T11:05:00Z"
  }
}
```

---

### Update Order Status
**PUT** `/orders/:id`

Cập nhật trạng thái đơn hàng (ADMIN, STAFF).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Request:
{
  "status": "CONFIRMED"
}

Response:
{
  "success": true,
  "message": "Cập nhật đơn hàng thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439031",
    "user": "507f1f77bcf86cd799439002",
    "items": [...],
    "totalPrice": 300000,
    "status": "CONFIRMED",
    "createdAt": "2024-01-15T11:05:00Z"
  }
}
```

**Status Values:**
- `PENDING` - Chờ xác nhận
- `CONFIRMED` - Đã xác nhận
- `SHIPPED` - Đã vận chuyển
- `COMPLETED` - Hoàn thành
- `CANCELLED` - Đã hủy

---

## ⭐ Reviews API

### Get Product Reviews
**GET** `/reviews/product/:productId`

Lấy danh sách đánh giá sản phẩm (Public).

```json
Response:
{
  "success": true,
  "message": "Lấy danh sách đánh giá thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "product": "507f1f77bcf86cd799439020",
      "user": "507f1f77bcf86cd799439002",
      "rating": 5,
      "comment": "Sản phẩm rất tuyệt vời",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

---

### Create Review
**POST** `/reviews`

Tạo đánh giá sản phẩm (Protected).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Request:
{
  "product": "507f1f77bcf86cd799439020",
  "rating": 5,
  "comment": "Áo rất đẹp, chất liệu tốt"
}

Response:
{
  "success": true,
  "message": "Tạo đánh giá thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439041",
    "product": "507f1f77bcf86cd799439020",
    "user": {
      "_id": "507f1f77bcf86cd799439002",
      "name": "User Name"
    },
    "rating": 5,
    "comment": "Áo rất đẹp, chất liệu tốt",
    "createdAt": "2024-01-15T12:05:00Z"
  }
}
```

---

## ❤️ Wishlist API

### Get Wishlist
**GET** `/wishlist`

Lấy danh sách yêu thích của người dùng (Protected).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response:
{
  "success": true,
  "message": "Lấy danh sách yêu thích thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "user": "507f1f77bcf86cd799439002",
    "products": [
      {
        "_id": "507f1f77bcf86cd799439020",
        "name": "Áo T-Shirt Trắng",
        "price": 150000
      }
    ]
  }
}
```

---

### Add to Wishlist
**POST** `/wishlist`

Thêm sản phẩm vào danh sách yêu thích (Protected).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Request:
{
  "product": "507f1f77bcf86cd799439020"
}

Response:
{
  "success": true,
  "message": "Thêm vào danh sách yêu thích thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "user": "507f1f77bcf86cd799439002",
    "products": [...]
  }
}
```

---

### Remove from Wishlist
**DELETE** `/wishlist/:productId`

Xóa sản phẩm khỏi danh sách yêu thích (Protected).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response:
{
  "success": true,
  "message": "Xóa khỏi danh sách yêu thích thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439050",
    "user": "507f1f77bcf86cd799439002",
    "products": [...]
  }
}
```

---

## 🎟️ Coupons API

### Get All Coupons
**GET** `/coupons`

Lấy danh sách tất cả mã giảm giá (ADMIN only).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Response:
{
  "success": true,
  "message": "Lấy danh sách mã giảm giá thành công",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439060",
      "code": "SAVE10",
      "discount": 10,
      "discountType": "PERCENTAGE",
      "maxUses": 100,
      "usedCount": 45,
      "expiryDate": "2024-12-31T23:59:59Z",
      "createdAt": "2024-01-15T13:00:00Z"
    }
  ]
}
```

---

### Create Coupon
**POST** `/coupons`

Tạo mã giảm giá (ADMIN only).

**Headers:**
```
Authorization: Bearer <token>
```

```json
Request:
{
  "code": "SAVE20",
  "discount": 20,
  "discountType": "PERCENTAGE",
  "maxUses": 50,
  "expiryDate": "2024-12-31"
}

Response:
{
  "success": true,
  "message": "Tạo mã giảm giá thành công",
  "data": {
    "_id": "507f1f77bcf86cd799439061",
    "code": "SAVE20",
    "discount": 20,
    "discountType": "PERCENTAGE",
    "maxUses": 50,
    "usedCount": 0,
    "expiryDate": "2024-12-31T23:59:59Z",
    "createdAt": "2024-01-15T13:05:00Z"
  }
}
```

---

## 🔒 Authorization Roles

### USER (Người Dùng Thường)
- ✅ Xem sản phẩm & danh mục
- ✅ Tạo & xem đơn hàng của mình
- ✅ Quản lý giỏ hàng
- ✅ Tạo đánh giá sản phẩm

### STAFF (Nhân Viên)
- ✅ Tất cả quyền của USER
- ✅ Tạo & cập nhật sản phẩm
- ✅ Cập nhật trạng thái đơn hàng

### ADMIN (Quản Trị)
- ✅ Tất cả quyền của STAFF
- ✅ Quản lý danh mục
- ✅ Quản lý người dùng
- ✅ Quản lý mã giảm giá

---

## 📝 Error Responses

Tất cả lỗi trả về format thống nhất:

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "data": null
}
```

### Common Error Codes

| Status | Message | Ý Nghĩa |
|--------|---------|--------|
| 400 | Bad Request | Dữ liệu không hợp lệ |
| 401 | Unauthorized | Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Tài nguyên không tìm thấy |
| 500 | Internal Error | Lỗi server |

---

## 🧪 Testing API

### Dùng Postman
1. Import collection từ `backend/postman_collection.json` (nếu có)
2. Set environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: Token từ login response

### Dùng cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"password123"}'

# Get All Categories
curl -X GET http://localhost:5000/api/categories

# Create Category (with token)
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Áo","description":"Áo trang phục"}'
```

---

## 📖 Ghi Chú Quan Trọng

1. **JWT Token**: Thời gian sống mặc định là 7 ngày (có thể cấu hình)
2. **CORS**: Đã bật cho tất cả origin (có thể cấu hình cho production)
3. **Error Handling**: Tập trung ở backend, frontend chỉ cần hiển thị message
4. **Response Format**: Tất cả endpoint tuân theo format thống nhất
5. **Validation**: Được thực hiện cả ở middleware và controller

---

**Last Updated**: 2024-01-15 | **Version**: 1.0
