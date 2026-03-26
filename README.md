# 👕 Clothing Shop - Hệ Thống Web Bán Hàng Full Stack

## 🚀 Tổng Quan Dự Án

Hệ thống web bán quần áo (giống Điện Máy Xanh) được xây dựng theo kiến trúc **RESTful API** với:

| Phần | Công nghệ |
|------|-----------|
| **Backend** | Node.js + Express.js + MongoDB (Mongoose) |
| **Frontend** | React 18 + Vite + React Router |
| **Authentication** | JWT Token + Google OAuth (Firebase) |
| **Database** | MongoDB |
| **Real-time** | Socket.io |

---

## 📁 Cấu Trúc Dự Án

```
clothing-shop/
│
├── backend/                          # RESTful API (Node.js + Express)
│   ├── config/
│   │   ├── connectDB.js             # Kết nối MongoDB
│   │   ├── firebase.js              # Firebase Admin SDK
│   │   ├── socket.js                # Socket.io config
│   │   └── upload.js                # Multer upload config
│   ├── controllers/                  # Xử lý request/response
│   │   ├── authController.js        # Đăng ký, đăng nhập
│   │   ├── userController.js        # Quản lý user
│   │   ├── productController.js     # CRUD sản phẩm
│   │   ├── categoryController.js    # CRUD danh mục
│   │   ├── orderController.js       # CRUD đơn hàng
│   │   ├── couponController.js      # CRUD coupon
│   │   ├── reviewController.js      # Đánh giá sản phẩm
│   │   ├── wishlistController.js    # Yêu thích
│   │   ├── chatController.js        # Nhắn tin
│   │   ├── paymentController.js    # Thanh toán
│   │   ├── withdrawalController.js  # Rút tiền
│   │   └── adminController.js       # Thống kê admin
│   ├── models/                       # Schema database (MongoDB)
│   │   ├── User.js, Product.js, Category.js, Order.js
│   │   ├── Coupon.js, Review.js, Wishlist.js
│   │   ├── Message.js, Withdrawal.js
│   ├── routes/                       # Định nghĩa API endpoints
│   ├── middlewares/                   # Middleware (auth, errorHandler)
│   ├── app.js                         # Express app config
│   ├── server.js                      # Entry point
│   └── package.json
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── Navbar.jsx, Footer.jsx, Modal.jsx
│   │   │   ├── ProductFilterPanel.jsx, Carousel.jsx
│   │   │   ├── ReviewForm.jsx, ReviewSection.jsx
│   │   │   ├── ChatWidget.jsx, ToastNotification.jsx
│   │   │   └── CouponFormModal.jsx, ProductFormModal.jsx
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.jsx         # Trang chủ
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── LoginPage.jsx, RegisterPage.jsx
│   │   │   ├── CartPage.jsx, MyOrdersPage.jsx
│   │   │   ├── WishlistPage.jsx, UserProfilePage.jsx
│   │   │   ├── ChangePasswordPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx, ResetPasswordPage.jsx
│   │   │   ├── PaymentResultPage.jsx, MockPaymentPage.jsx
│   │   │   ├── Admin/               # Admin pages
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminProductsPage.jsx
│   │   │   │   ├── AdminOrdersPage.jsx
│   │   │   │   ├── AdminCategoriesPage.jsx
│   │   │   │   ├── AdminUsersPage.jsx
│   │   │   │   ├── AdminCouponsPage.jsx
│   │   │   │   └── AdminWithdrawalsPage.jsx
│   │   │   └── Staff/               # Staff pages
│   │   │       ├── StaffDashboard.jsx
│   │   │       └── StaffProductsPage.jsx
│   │   ├── services/                # API service layer
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   └── ... (14 service files)
│   │   ├── context/                  # React Context
│   │   │   ├── AuthContext.jsx       # Quản lý auth state
│   │   │   └── NotificationContext.jsx
│   │   ├── layouts/                  # Layout components
│   │   │   └── MainLayout.jsx
│   │   ├── config/                   # Firebase config
│   │   ├── App.jsx                   # Main app
│   │   └── main.jsx                  # Entry point
│   └── package.json
│
└── README.md                         # File này
```

---

## 🔄 Cách Hoạt Động

### 1. Kiến Trúc Tổng Quan

```
┌─────────────┐      HTTP/JSON       ┌─────────────┐
│   Browser   │ ◄──────────────────► │   Backend   │
│  (React)    │                      │  (Express)  │
└─────────────┘                      └──────┬──────┘
                                             │
                                        MongoDB
```

### 2. RESTful API Flow

```
Client (Frontend)                    Server (Backend)
     │                                    │
     │  GET /api/products                │
     ├──────────────────────────────────►│
     │                                   │ Controller
     │                                   │   │
     │                                   │   ▼
     │                                   │ Model (MongoDB)
     │                                   │   │
     │  ◄────────────────────────────────┤
     │  JSON Response                    │
```

### 3. Authentication Flow

```
1. User đăng nhập → POST /api/auth/login
2. Server verify → Trả về JWT token
3. Frontend lưu token vào localStorage
4. Request tiếp theo → Header: Authorization: Bearer <token>
5. Middleware verifyToken → Cho phép truy cập
```

---

## ✨ Tính Năng

### 🔐 Authentication
- Đăng ký / Đăng nhập (local)
- Đăng nhập Google (Firebase OAuth)
- JWT Token authentication
- Quên mật khẩu / Đặt lại mật khẩu

### 📦 Quản Lý Sản Phẩm
- CRUD sản phẩm (Admin/Staff)
- Upload hình ảnh (Cloudinary)
- Quản lý tồn kho
- Lọc, tìm kiếm, sắp xếp

### 📂 Quản Lý Danh Mục
- CRUD danh mục (Admin)

### 🛒 Giỏ Hàng & Đơn Hàng
- Thêm/sửa/xóa sản phẩm trong giỏ
- Áp dụng mã giảm giá (coupon)
- Luồng trạng thái đơn hàng:
  ```
  PENDING → CONFIRMED → SHIPPED → DELIVERING → ARRIVED → PAID_TO_SHIPPER → COMPLETED
       ↓                                                         ↓
    CANCELLED                                               CANCELLED
  ```

### 💳 Thanh Toán
- COD (Thanh toán khi nhận hàng)
- Mock VNPay (Giả lập thanh toán online)

### 💬 Chat System
- Nhắn tin User ↔ Admin/Staff
- Tin nhắn chưa đọc (badge)
- Real-time với Socket.io

### ⭐ Đánh Giá & Yêu Thích
- Đánh giá sản phẩm (1-5 sao)
- Wishlist (yêu thích)
          
### 📊 Dashboard
- **Admin**: Thống kê, quản lý users, categories, products, orders, coupons, withdrawals
- **Staff**: Quản lý sản phẩm, đơn hàng

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
| Rút tiền | ✅ | ✅ | ✅ |

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

**Backend (.env)**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/clothing_shop
JWT_SECRET=your_secret_key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

**Frontend (.env.local)**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Deployment

- **Backend**: Render (https://clothing-shop-api-8wae.onrender.com)
- **Frontend**: Vercel (https://clothing-shop-ashy.vercel.app)

---

## 📝 Tài Liệu Test API

- **Test Localhost**: Xem `API_TEST_LOCALHOST.md`
- **Test Deployed**: Xem `API_TEST_DEPLOYED.md`

---

## ✅ Yêu Cầu Đồ Án Đã Đạt

| Yêu cầu | Trạng thái |
|----------|------------|
| Viết bằng Node.js | ✅ |
| RESTful API | ✅ |
| MongoDB | ✅ |
| Không dùng MVC | ✅ |
| Có báo cáo | ✅ |
| Có giao diện | ✅ |

---

**© 2026 - Clothing Shop Project**
