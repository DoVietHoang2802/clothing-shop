# 👕 Clothing Shop - Hệ Thống Web Bán Hàng Full Stack

> Website bán quần áo trực tuyến với đầy đủ tính năng quản lý đơn hàng, thanh toán MoMo, và real-time notifications.

## 🚀 Tổng Quan

| Phần | Công nghệ |
|------|-----------|
| **Backend** | Node.js + Express.js + MongoDB (Mongoose) |
| **Frontend** | React 18 + Vite + React Router |
| **Authentication** | JWT Token + Google OAuth (Firebase) |
| **Database** | MongoDB Atlas |
| **Real-time** | SSE (Server-Sent Events) |
| **Payment** | MoMo UAT (Test Environment) |

---

## 📁 Cấu Trúc Dự Án

```
clothing-shop/
├── backend/                          # RESTful API Server
│   ├── config/
│   │   ├── connectDB.js             # Kết nối MongoDB
│   │   ├── firebase.js              # Firebase Admin SDK (OAuth)
│   │   ├── momo.js                   # MoMo payment config
│   │   ├── socket.js                # Socket.io config
│   │   └── upload.js                # Multer upload config
│   ├── controllers/                  # Xử lý business logic
│   │   ├── authController.js        # Đăng ký, đăng nhập, OAuth
│   │   ├── userController.js        # Quản lý người dùng
│   │   ├── productController.js     # CRUD sản phẩm
│   │   ├── categoryController.js    # CRUD danh mục
│   │   ├── orderController.js       # CRUD đơn hàng + SSE
│   │   ├── orderSSEController.js    # Server-Sent Events
│   │   ├── couponController.js      # CRUD coupon
│   │   ├── reviewController.js      # Đánh giá sản phẩm
│   │   ├── wishlistController.js    # Yêu thích
│   │   ├── chatController.js        # Nhắn tin User ↔ Admin
│   │   ├── notificationController.js # Thông báo
│   │   ├── paymentController.js    # Thanh toán MoMo
│   │   └── adminController.js       # Dashboard thống kê
│   ├── models/                       # MongoDB Schemas
│   │   ├── User.js, Product.js, Category.js, Order.js
│   │   ├── Coupon.js, Review.js, Wishlist.js
│   │   ├── Message.js, Notification.js, Address.js
│   ├── routes/                       # API endpoints
│   │   ├── auth.js, user.js, product.js, category.js
│   │   ├── order.js, coupon.js, review.js, wishlist.js
│   │   ├── chat.js, notification.js, momo.js, admin.js
│   ├── middlewares/                  # verifyToken, authorizeRoles
│   ├── utils/                        # asyncHandler
│   ├── app.js                        # Express app
│   ├── server.js                     # Entry point
│   ├── serviceAccountKey.json        # Firebase Admin SDK
│   └── package.json
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Navbar.jsx            # Thanh điều hướng
│   │   │   ├── Footer.jsx            # Footer
│   │   │   ├── Modal.jsx             # Base modal
│   │   │   ├── Carousel.jsx          # Banner carousel
│   │   │   ├── ProductFilterPanel.jsx # Bộ lọc sản phẩm
│   │   │   ├── ProductFormModal.jsx  # Form thêm/sửa sản phẩm
│   │   │   ├── CategoryFormModal.jsx # Form thêm/sửa danh mục
│   │   │   ├── CouponFormModal.jsx   # Form thêm/sửa coupon
│   │   │   ├── UserFormModal.jsx     # Form thêm/sửa user
│   │   │   ├── ReviewForm.jsx        # Form đánh giá
│   │   │   ├── ReviewSection.jsx     # Hiển thị đánh giá
│   │   │   ├── ChatWidget.jsx        # Widget chat
│   │   │   ├── CouponInput.jsx       # Input nhập coupon
│   │   │   ├── ToastNotification.jsx # Toast messages
│   │   │   ├── FlashSaleTimer.jsx    # Đếm ngược flash sale
│   │   │   ├── FloatingContactBubbles.jsx # Nút liên hệ
│   │   │   ├── ContactInfoModal.jsx  # Modal thông tin liên hệ
│   │   │   └── FlashSaleTimer.jsx    # Timer flash sale
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.jsx          # Trang chủ
│   │   │   ├── ProductDetailPage.jsx # Chi tiết sản phẩm
│   │   │   ├── LoginPage.jsx         # Đăng nhập
│   │   │   ├── RegisterPage.jsx      # Đăng ký
│   │   │   ├── CartPage.jsx          # Giỏ hàng
│   │   │   ├── MyOrdersPage.jsx      # Đơn hàng của tôi
│   │   │   ├── WishlistPage.jsx      # Sản phẩm yêu thích
│   │   │   ├── UserProfilePage.jsx   # Thông tin tài khoản
│   │   │   ├── AddressPage.jsx       # Quản lý địa chỉ
│   │   │   ├── ChangePasswordPage.jsx # Đổi mật khẩu
│   │   │   ├── ForgotPasswordPage.jsx # Quên mật khẩu
│   │   │   ├── ResetPasswordPage.jsx # Đặt lại mật khẩu
│   │   │   ├── NotificationPage.jsx # Trang thông báo
│   │   │   ├── PaymentResultPage.jsx # Kết quả thanh toán
│   │   │   ├── Admin/
│   │   │   │   ├── AdminDashboard.jsx   # Dashboard admin
│   │   │   │   ├── AdminProductsPage.jsx
│   │   │   │   ├── AdminOrdersPage.jsx
│   │   │   │   ├── AdminCategoriesPage.jsx
│   │   │   │   ├── AdminUsersPage.jsx
│   │   │   │   └── AdminCouponsPage.jsx
│   │   │   └── Staff/
│   │   │       ├── StaffDashboard.jsx   # Dashboard staff
│   │   │       └── StaffProductsPage.jsx
│   │   ├── services/                # API service layer
│   │   │   ├── api.js               # Axios instance + interceptors
│   │   │   ├── authService.js       # Auth API
│   │   │   ├── googleAuthService.js # Google OAuth
│   │   │   ├── productService.js    # Sản phẩm
│   │   │   ├── orderService.js      # Đơn hàng
│   │   │   ├── momoService.js       # Thanh toán MoMo
│   │   │   ├── userService.js       # User API
│   │   │   ├── categoryService.js   # Danh mục
│   │   │   ├── couponService.js     # Coupon
│   │   │   ├── reviewService.js     # Đánh giá
│   │   │   ├── wishlistService.js   # Yêu thích
│   │   │   ├── chatService.js       # Chat
│   │   │   ├── notificationService.js # Thông báo
│   │   │   ├── addressService.js    # Địa chỉ
│   │   │   └── adminService.js      # Admin API
│   │   ├── context/                  # React Context
│   │   │   ├── AuthContext.jsx       # Auth state
│   │   │   └── NotificationContext.jsx
│   │   ├── config/                   # App configuration
│   │   │   ├── sse.js               # SSE real-time service
│   │   │   ├── notificationSSE.js    # (Backup SSE)
│   │   │   └── firebase.js          # Firebase config
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx        # Main layout
│   │   ├── routes/
│   │   │   └── PrivateRoute.jsx     # Protected routes
│   │   ├── App.jsx                   # Main app + routing
│   │   └── main.jsx                  # Entry point
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

---

## ✨ Tính Năng

### 🔐 Authentication
- Đăng ký / Đăng nhập tài khoản local
- Đăng nhập Google (Firebase OAuth)
- JWT Token với refresh mechanism
- Quên mật khẩu / Đặt lại mật khẩu qua email

### 🛍️ Mua Sắm
- Xem sản phẩm, tìm kiếm, lọc theo danh mục/giá
- Thêm vào giỏ hàng, wishlist
- Áp dụng mã giảm giá (coupon)
- Xem chi tiết sản phẩm, đánh giá

### 📦 Quản Lý Đơn Hàng
- Luồng trạng thái đơn hàng:
  ```
  PENDING → CONFIRMED → SHIPPED → DELIVERING → ARRIVED → PAID_TO_SHIPPER → COMPLETED
               ↓                                                         ↓
            CANCELLED                                               CANCELLED
  ```
- Theo dõi đơn hàng real-time (SSE)
- Xác nhận thanh toán cho shipper (COD)
- Xác nhận đã nhận hàng (MoMo)

### 💳 Thanh Toán
- **COD**: Thanh toán khi nhận hàng
- **MoMo**: Thanh toán qua ví MoMo (UAT - test)
- Xác nhận thanh toán cho shipper

### 💬 Chat System
- Nhắn tin trực tiếp User ↔ Admin/Staff
- Badge số tin nhắn chưa đọc
- Real-time notifications

### 🔔 Notification System
- Thông báo đơn hàng mới cho Admin/Staff
- Thông báo cập nhật trạng thái cho User
- Real-time với SSE

### ⭐ Đánh Giá
- Đánh giá sản phẩm (1-5 sao + bình luận)
- Hiển thị đánh giá trên trang sản phẩm

### 📊 Dashboard
| Role | Chức năng |
|------|-----------|
| **Admin** | Quản lý users, categories, products, orders, coupons, dashboard thống kê |
| **Staff** | Quản lý sản phẩm, xử lý đơn hàng, dashboard |

---

## 👥 Vai Trò & Quyền Hạn

| Tính năng | USER | STAFF | ADMIN |
|------------|:----:|:-----:|:-----:|
| Xem sản phẩm | ✅ | ✅ | ✅ |
| Mua hàng | ✅ | ✅ | ✅ |
| CRUD sản phẩm | ❌ | ✅ | ✅ |
| Xóa sản phẩm | ❌ | ❌ | ✅ |
| CRUD danh mục | ❌ | ❌ | ✅ |
| Quản lý đơn hàng | ❌ | ✅ | ✅ |
| CRUD coupon | ❌ | ❌ | ✅ |
| CRUD users | ❌ | ❌ | ✅ |
| Thống kê | ❌ | ✅ | ✅ |
| Chat | ✅ | ✅ | ✅ |

---

## 🛠️ Cách Chạy Local

### 1. Backend

```bash
cd backend
npm install
npm run dev
# Server chạy: http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend chạy: http://localhost:5173
```

### 3. Cấu hình Environment

**Backend (`.env`)**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/clothing_shop
JWT_SECRET=your_secret_key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
API_PROTOCOL=https
```

**Frontend (`.env.local`)**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 🌐 Deployment

| Service | URL |
|---------|-----|
| **Frontend** | https://clothing-shop-ashy.vercel.app |
| **Backend** | https://clothing-shop-api-8wae.onrender.com |

### Backend Environment Variables (Render)
```
PORT=5000
MONGO_URI=<mongodb_atlas_connection_string>
JWT_SECRET=<your_jwt_secret>
FIREBASE_SERVICE_ACCOUNT=<firebase_service_account_json>
API_PROTOCOL=https
```

### Frontend Environment Variables (Vercel)
```
VITE_API_BASE_URL=https://clothing-shop-api-8wae.onrender.com/api
VITE_FIREBASE_API_KEY=<firebase_config>
VITE_FIREBASE_AUTH_DOMAIN=<firebase_config>
VITE_FIREBASE_PROJECT_ID=<firebase_config>
VITE_FIREBASE_STORAGE_BUCKET=<firebase_config>
VITE_FIREBASE_MESSAGING_SENDER_ID=<firebase_config>
VITE_FIREBASE_APP_ID=<firebase_config>
```

---

## 🔌 Real-time Architecture (SSE)

### Tại sao dùng SSE?
- Render Free tier không hỗ trợ WebSocket
- SSE chỉ cần HTTP, hoạt động tốt với serverless
- 1 connection duy nhất cho tất cả events

### SSE Flow
```
User đặt hàng
    ↓
Backend: createOrder() → broadcastNewOrder() → SSE tới Admin
    ↓
Admin nhận event → Toast + Update UI

Admin duyệt đơn
    ↓
Backend: updateOrderStatus() → broadcastOrderUpdate() → SSE tới User + Admin
    ↓
User nhận event → Toast + Update UI
```

### SSE Endpoints
| Endpoint | Mô tả |
|----------|-------|
| `GET /api/orders/sse?token=<jwt>` | Order updates + Notifications |

### SSE Events
| Event | Target | Mô tả |
|-------|--------|--------|
| `NEW_ORDER` | Admin | Đơn hàng mới |
| `ORDER_STATUS_CHANGED` | User + Admin | Cập nhật trạng thái |
| `new_notification` | User + Admin | Thông báo mới |

### Performance
- 1 SSE connection duy nhất cho tất cả features
- Exponential backoff khi reconnect (3s → 30s max)
- Polling fallback mỗi 30s cho notification bell

---

## 📂 Database Models

| Model | Mô tả |
|-------|-------|
| **User** | Tài khoản (local + OAuth), role, avatar |
| **Product** | Sản phẩm, tồn kho, giá, hình ảnh |
| **Category** | Danh mục sản phẩm |
| **Order** | Đơn hàng, trạng thái, items, thanh toán |
| **Coupon** | Mã giảm giá, giảm theo % hoặc fixed |
| **Review** | Đánh giá sản phẩm (1-5 sao) |
| **Wishlist** | Sản phẩm yêu thích |
| **Message** | Tin nhắn chat |
| **Notification** | Thông báo |
| **Address** | Địa chỉ giao hàng |

---

## 🔒 Security

- JWT token authentication cho tất cả protected routes
- Role-based access control (RBAC)
- CORS configuration cho production domains
- Input validation ở backend
- Password hashing (bcrypt)

---

## 📝 API Endpoints Chính

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/google` - Đăng nhập Google OAuth
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password/:token` - Đặt lại mật khẩu

### Products & Categories
- `GET /api/products` - Danh sách sản phẩm (filter, search, pagination)
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin/Staff)
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `GET /api/categories` - Danh sách danh mục

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/my` - Đơn hàng của tôi
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (Admin/Staff)
- `PUT /api/orders/:id/received` - Xác nhận đã nhận hàng (MoMo)
- `PUT /api/orders/:id/paid-to-shipper` - Xác nhận thanh toán (COD)

### Payments (MoMo)
- `POST /api/momo/create` - Tạo payment MoMo
- `GET /api/momo/return` - Redirect sau thanh toán
- `POST /api/momo/ipn` - IPN callback từ MoMo

### Chat & Notifications
- `POST /api/chat/send` - Gửi tin nhắn
- `GET /api/chat/:userId` - Lấy tin nhắn
- `GET /api/orders/sse` - SSE real-time

---

**© 2026 - Clothing Shop Project**