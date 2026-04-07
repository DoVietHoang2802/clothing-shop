đồ trực tuyến với đầy đủ tính năng quản lý đơn hàng, thanh toán MoMo, và real-time notifications.

---

## 📋 MỤC LỤC

1. [Tổng Quan](#-tổng-quan)
2. [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
3. [Mô Hình Xử Lý](#-mô-hình-xử-lý)
4. [Tính Năng](#-tính-năng)
5. [API Endpoints](#-api-endpoints)
6. [Cấu Hình](#-cấu-hình)
7. [Deployment](#-deployment)
8. [Real-time (SSE)](#-realtime-sse)
9. [Database Models](#-database-models)

---

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
│
├── backend/                          # RESTful API Server
│   ├── config/
│   │   ├── connectDB.js             # Kết nối MongoDB
│   │   ├── firebase.js              # Firebase Admin SDK (OAuth)
│   │   ├── momo.js                 # MoMo payment config
│   │   └── upload.js               # Multer upload config
│   │
│   ├── controllers/                  # XỬ LÝ LOGIC
│   │   ├── authController.js        # Đăng ký, đăng nhập, OAuth
│   │   ├── userController.js        # Quản lý người dùng
│   │   ├── productController.js     # CRUD sản phẩm
│   │   ├── categoryController.js     # CRUD danh mục
│   │   ├── orderController.js       # CRUD đơn hàng + SSE
│   │   ├── orderSSEController.js    # Server-Sent Events cho orders
│   │   ├── couponController.js      # CRUD coupon
│   │   ├── reviewController.js      # Đánh giá sản phẩm
│   │   ├── wishlistController.js    # Yêu thích
│   │   ├── notificationController.js # Thông báo
│   │   ├── paymentController.js     # Thanh toán MoMo
│   │   ├── addressController.js     # Địa chỉ giao hàng
│   │   └── adminController.js       # Dashboard thống kê
│   │
│   ├── routes/                       # ĐIỀU HƯỚNG
│   │   ├── auth.js                  # POST /api/auth/*
│   │   ├── user.js                # GET/PUT /api/users/*
│   │   ├── product.js             # CRUD /api/products/*
│   │   ├── category.js            # CRUD /api/categories/*
│   │   ├── order.js              # CRUD /api/orders/*
│   │   ├── coupon.js             # CRUD /api/coupons/*
│   │   ├── review.js             # CRUD /api/reviews/*
│   │   ├── wishlist.js           # CRUD /api/wishlist/*
│   │   ├── notification.js       # CRUD /api/notifications/*
│   │   ├── momo.js               # MoMo payment endpoints
│   │   ├── address.js            # CRUD /api/addresses/*
│   │   └── admin.js              # Dashboard /api/admin/*
│   │
│   ├── models/                       # MONGOOSE SCHEMAS
│   │   ├── User.js              # Tài khoản (local + OAuth)
│   │   ├── Product.js           # Sản phẩm
│   │   ├── Category.js         # Danh mục
│   │   ├── Order.js            # Đơn hàng
│   │   ├── Coupon.js           # Mã giảm giá
│   │   ├── Review.js           # Đánh giá
│   │   ├── Wishlist.js         # Yêu thích
│   │   ├── Notification.js      # Thông báo
│   │   └── Address.js          # Địa chỉ
│   │
│   ├── middlewares/
│   │   ├── auth.js            # verifyToken, authorizeRoles
│   │   └── errorHandler.js     # Xử lý lỗi
│   │
│   ├── utils/
│   │   └── asyncHandler.js     # Wrapper async handler
│   │
│   ├── app.js                  # Express app (đăng ký routes)
│   ├── server.js               # Entry point
│   └── package.json
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Navbar.jsx          # Thanh điều hướng
│   │   │   ├── Footer.jsx          # Footer
│   │   │   ├── Carousel.jsx        # Banner carousel
│   │   │   ├── ProductFilterPanel.jsx # Bộ lọc sản phẩm
│   │   │   ├── ReviewSection.jsx   # Hiển thị đánh giá
│   │   │   └── ToastNotification.jsx # Toast messages
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.jsx         # Trang chủ
│   │   │   ├── ProductDetailPage.jsx # Chi tiết sản phẩm
│   │   │   ├── LoginPage.jsx        # Đăng nhập
│   │   │   ├── RegisterPage.jsx     # Đăng ký
│   │   │   ├── CartPage.jsx         # Giỏ hàng
│   │   │   ├── MyOrdersPage.jsx     # Đơn hàng của tôi
│   │   │   ├── WishlistPage.jsx     # Yêu thích
│   │   │   ├── UserProfilePage.jsx  # Tài khoản
│   │   │   ├── PaymentResultPage.jsx # Kết quả thanh toán
│   │   │   │
│   │   │   ├── Admin/
│   │   │   │   ├── AdminDashboard.jsx    # Dashboard
│   │   │   │   ├── AdminProductsPage.jsx
│   │   │   │   ├── AdminOrdersPage.jsx
│   │   │   │   ├── AdminCategoriesPage.jsx
│   │   │   │   ├── AdminUsersPage.jsx
│   │   │   │   └── AdminCouponsPage.jsx
│   │   │   │
│   │   │   └── Staff/
│   │   │       ├── StaffDashboard.jsx
│   │   │       └── StaffProductsPage.jsx
│   │   │
│   │   ├── services/                # API service layer
│   │   │   ├── api.js              # Axios instance + interceptors
│   │   │   ├── authService.js      # Auth API
│   │   │   ├── productService.js  # Sản phẩm
│   │   │   ├── orderService.js    # Đơn hàng
│   │   │   ├── momoService.js      # MoMo payment
│   │   │   └── ...
│   │   │
│   │   ├── config/
│   │   │   ├── sse.js             # SSE real-time service
│   │   │   └── firebase.js        # Firebase config (Google OAuth)
│   │   │
│   │   └── context/
│   │       ├── AuthContext.jsx     # Auth state
│   │       └── NotificationContext.jsx
│   │
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

---

## 🏗️ Mô Hình Xử Lý

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  Pages → Services (api.js) → HTTP Request                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/JSON
┌──────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js)                         │
│  ┌─────────────┐                                             │
│  │   app.js    │  ← Đăng ký tất cả routes                   │
│  └──────┬──────┘                                             │
│         │                                                    │
│  ┌──────▼──────┐     ┌─────────────────────────────────┐    │
│  │   routes/   │────►│ controllers/                     │    │
│  │  (Điều hướng)│     │ XỬ LÝ LOGIC (KHÔNG điều hướng) │    │
│  └─────────────┘     └──────┬────────────────────────────┘    │
│                            │                                 │
│                            ▼                                 │
│                    ┌──────────────┐                          │
│                    │   models/   │                          │
│                    │  (MongoDB)  │                          │
│                    └─────────────┘                          │
└──────────────────────────────────────────────────────────────┘
```

---

## ✨ Tính Năng

### 🔐 Authentication
- Đăng ký / Đăng nhập tài khoản local
- Đăng nhập Google (Firebase OAuth)
- JWT Token với refresh mechanism
- Quên mật khẩu / Đặt lại mật khẩu

### 🛍️ Mua Sắm
- Xem sản phẩm, tìm kiếm, lọc theo danh mục/giá
- Thêm vào giỏ hàng, wishlist
- Áp dụng mã giảm giá (coupon)
- Xem chi tiết sản phẩm, đánh giá

### 📦 Quản Lý Đơn Hàng
- Luồng trạng thái: `PENDING → CONFIRMED → SHIPPED → DELIVERING → ARRIVED → COMPLETED`
- Theo dõi đơn hàng real-time (SSE)
- Xác nhận thanh toán cho shipper (COD)
- Xác nhận đã nhận hàng (MoMo)

### 💳 Thanh Toán
- **COD**: Thanh toán khi nhận hàng
- **MoMo**: Thanh toán qua ví MoMo (UAT)

### 🔔 Notification System
- Thông báo đơn hàng mới cho Admin
- Thông báo cập nhật trạng thái cho User
- Real-time với SSE

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/google` | Đăng nhập Google |
| POST | `/api/auth/forgot-password` | Quên mật khẩu |
| POST | `/api/auth/reset-password/:token` | Đặt lại mật khẩu |
| POST | `/api/auth/change-password` | Đổi mật khẩu |

### Products
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/api/products` | Danh sách sản phẩm | Public |
| GET | `/api/products/:id` | Chi tiết sản phẩm | Public |
| POST | `/api/products` | Tạo sản phẩm | ADMIN, STAFF |
| PUT | `/api/products/:id` | Cập nhật sản phẩm | ADMIN, STAFF |
| DELETE | `/api/products/:id` | Xóa sản phẩm | ADMIN |

### Categories
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/api/categories` | Danh sách danh mục | Public |
| POST | `/api/categories` | Tạo danh mục | ADMIN |
| PUT | `/api/categories/:id` | Cập nhật danh mục | ADMIN |
| DELETE | `/api/categories/:id` | Xóa danh mục | ADMIN |

### Orders
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| POST | `/api/orders` | Tạo đơn hàng | USER |
| GET | `/api/orders/my` | Đơn hàng của tôi | USER |
| GET | `/api/orders/:id` | Chi tiết đơn hàng | USER, STAFF, ADMIN |
| GET | `/api/orders` | Tất cả đơn hàng | STAFF, ADMIN |
| PUT | `/api/orders/:id/status` | Cập nhật trạng thái | STAFF, ADMIN |
| PUT | `/api/orders/:id/received` | Xác nhận nhận hàng (MoMo) | USER |
| PUT | `/api/orders/:id/paid-to-shipper` | Thanh toán cho shipper (COD) | USER |
| PUT | `/api/orders/:id/cancel` | Hủy đơn hàng | USER |
| DELETE | `/api/orders/:id` | Xóa đơn hàng | USER, STAFF |
| GET | `/api/orders/sse` | SSE real-time | All |

### Notifications
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/api/notifications` | Danh sách thông báo | All |
| GET | `/api/notifications/:id` | Chi tiết thông báo | All |
| PUT | `/api/notifications/:id/read` | Đánh dấu đã đọc | All |
| PUT | `/api/notifications/read-all` | Đánh dấu đã đọc tất cả | All |
| DELETE | `/api/notifications/:id` | Xóa thông báo | All |
| DELETE | `/api/notifications/read` | Xóa thông báo đã đọc | All |

### Addresses
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/api/addresses` | Danh sách địa chỉ | USER |
| GET | `/api/addresses/:id` | Chi tiết địa chỉ | USER |
| POST | `/api/addresses` | Tạo địa chỉ | USER |
| PUT | `/api/addresses/:id` | Cập nhật địa chỉ | USER |
| DELETE | `/api/addresses/:id` | Xóa địa chỉ | USER |
| PUT | `/api/addresses/:id/default` | Đặt mặc định | USER |

### Wishlist
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/api/wishlist` | Danh sách yêu thích | USER |
| POST | `/api/wishlist` | Thêm vào yêu thích | USER |
| DELETE | `/api/wishlist/:productId` | Xóa khỏi yêu thích | USER |
| GET | `/api/wishlist/check/:productId` | Kiểm tra yêu thích | USER |

### Reviews
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/api/reviews/product/:productId` | Đánh giá sản phẩm | Public |
| GET | `/api/reviews/product/:productId/average` | Điểm trung bình | Public |
| POST | `/api/reviews` | Tạo đánh giá | USER |
| PUT | `/api/reviews/:id` | Cập nhật đánh giá | USER |
| DELETE | `/api/reviews/:id` | Xóa đánh giá | USER |

### Coupons
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| POST | `/api/coupons/validate` | Kiểm tra coupon | Public |
| GET | `/api/coupons` | Danh sách coupon | ADMIN |
| GET | `/api/coupons/:id` | Chi tiết coupon | ADMIN |
| POST | `/api/coupons` | Tạo coupon | ADMIN |
| PUT | `/api/coupons/:id` | Cập nhật coupon | ADMIN |
| DELETE | `/api/coupons/:id` | Xóa coupon | ADMIN |

### Users
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/api/users/profile` | Hồ sơ cá nhân | USER |
| PUT | `/api/users/profile` | Cập nhật hồ sơ | USER |
| GET | `/api/users` | Tất cả người dùng | ADMIN |
| PUT | `/api/users/:id/role` | Cập nhật vai trò | ADMIN |
| DELETE | `/api/users/:id` | Xóa người dùng | ADMIN |

### MoMo Payment
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| POST | `/api/momo/create` | Tạo payment MoMo | USER |
| GET | `/api/momo/return` | Redirect sau thanh toán | Public |
| POST | `/api/momo/ipn` | IPN callback | Public |
| GET | `/api/momo/query/:orderId` | Query trạng thái | USER |

### Admin Dashboard
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/api/admin/stats` | Thống kê tổng quan | ADMIN |
| GET | `/api/admin/stats/chart` | Dữ liệu biểu đồ | ADMIN |

---

## ⚙️ Cấu Hình

### Backend (.env)

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/clothing-shop

# JWT
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}

# Production Protocol (Render: set = https)
API_PROTOCOL=https
```

### Frontend (.env.local)

```env
# API URL
VITE_API_BASE_URL=http://localhost:5000/api

# Firebase Config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Frontend (.env.production)

```env
VITE_API_BASE_URL=https://clothing-shop-api-8wae.onrender.com/api

# Firebase Config (production)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 🚀 Deployment

### Backend (Render)

1. Connect GitHub repo
2. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Environment Variables:
   ```
   PORT=5000
   MONGO_URI=<mongodb_atlas_connection_string>
   JWT_SECRET=<your_jwt_secret>
   FIREBASE_SERVICE_ACCOUNT=<firebase_service_account_json>
   API_PROTOCOL=https
   ```

### Frontend (Vercel)

1. Import GitHub repo
2. Framework: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   ```
   VITE_API_BASE_URL=https://clothing-shop-api-8wae.onrender.com/api
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

### URLs Deployment

| Service | URL |
|---------|-----|
| **Frontend** | https://clothing-shop-ashy.vercel.app |
| **Backend** | https://clothing-shop-api-8wae.onrender.com |

---

## 🔄 Real-time (SSE)

### Tại sao dùng SSE?

- Render Free tier không hỗ trợ WebSocket
- SSE chỉ cần HTTP, hoạt động tốt với serverless
- 1 connection cho tất cả events

### SSE Endpoints

| Endpoint | Events |
|----------|--------|
| `GET /api/orders/sse` | NEW_ORDER, ORDER_STATUS_CHANGED |
| `GET /api/notifications/sse` | new_notification |

### Luồng SSE

```
1. Client kết nối: GET /api/orders/sse?token=<jwt>
       ↓
2. Server lưu connection vào Map
       ↓
3. Event xảy ra (order created, status changed...)
       ↓
4. Server broadcast tới tất cả connections liên quan
       ↓
5. Client nhận event → Update UI real-time
```

### Performance

- 1 SSE connection cho tất cả features
- Heartbeat mỗi 15s để giữ kết nối
- Polling fallback mỗi 30s cho notification bell

---

## 💾 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (nullable for OAuth),
  role: 'USER' | 'STAFF' | 'ADMIN',
  avatar: String,
  provider: 'local' | 'google',
  providerId: String,
  createdAt: Date
}
```

### Product
```javascript
{
  name: String,
  description: String,
  price: Number,
  image: String,
  category: ObjectId,
  stock: Number,
  soldCount: Number,
  createdAt: Date
}
```

### Order
```javascript
{
  user: ObjectId,
  items: [{
    product: ObjectId,
    name: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String
  }],
  totalPrice: Number,
  finalPrice: Number,
  coupon: { code, discountType, discountValue },
  discountAmount: Number,
  shippingAddress: { fullName, phone, address, ward, district, city },
  paymentMethod: 'COD' | 'MOMO',
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED',
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERING' | 'ARRIVED' | 'PAID_TO_SHIPPER' | 'COMPLETED' | 'CANCELLED',
  momoOrderId: String,
  momoTransId: String,
  createdAt: Date
}
```

### Coupon
```javascript
{
  code: String (unique),
  discountType: 'PERCENTAGE' | 'FIXED',
  discountValue: Number,
  minOrderValue: Number,
  maxDiscount: Number,
  usageLimit: Number,
  usageCount: Number,
  expiresAt: Date,
  isActive: Boolean
}
```

### Review
```javascript
{
  product: ObjectId,
  user: ObjectId,
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

### Wishlist
```javascript
{
  user: ObjectId,
  product: ObjectId,
  createdAt: Date
}
```

### Notification
```javascript
{
  user: ObjectId,
  type: String,
  title: String,
  message: String,
  isRead: Boolean,
  link: String,
  createdAt: Date
}
```

### Address
```javascript
{
  user: ObjectId,
  fullName: String,
  phone: String,
  address: String,
  ward: String,
  district: String,
  city: String,
  isDefault: Boolean,
  label: 'home' | 'office' | 'other'
}
```

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
| Dashboard thống kê | ❌ | ✅ | ✅ |
| Đánh giá sản phẩm | ✅ | ✅ | ✅ |
| Quản lý địa chỉ | ✅ | ✅ | ✅ |

---

## 🛠️ Cách Chạy Local

### 1. Backend

```bash
cd backend
npm install
npm run dev
# Server: http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend: http://localhost:5173
```

---

**© 2026 - Clothing Shop Project**
