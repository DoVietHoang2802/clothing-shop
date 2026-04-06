# 👕 Clothing Shop - Hệ Thống Web Bán Hàng Full Stack

> Website bán quần áo trực tuyến với đầy đủ tính năng quản lý đơn hàng, thanh toán MoMo, và real-time notifications.

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
│   │   ├── momo.js                   # MoMo payment config
│   │   ├── socket.js                # Socket.io config
│   │   └── upload.js                # Multer upload config
│   │
│   ├── controllers/                  # XỬ LÝ LOGIC (KHÔNG điều hướng)
│   │   ├── authController.js        # Đăng ký, đăng nhập, OAuth
│   │   ├── userController.js        # Quản lý người dùng
│   │   ├── productController.js     # CRUD sản phẩm
│   │   ├── categoryController.js    # CRUD danh mục
│   │   ├── orderController.js       # CRUD đơn hàng + SSE
│   │   ├── orderSSEController.js    # Server-Sent Events cho orders
│   │   ├── chatController.js        # Nhắn tin User ↔ Admin/Staff
│   │   ├── couponController.js      # CRUD coupon
│   │   ├── reviewController.js      # Đánh giá sản phẩm
│   │   ├── wishlistController.js    # Yêu thích
│   │   ├── notificationController.js # Thông báo
│   │   ├── paymentController.js     # Thanh toán MoMo
│   │   ├── addressController.js     # Địa chỉ giao hàng
│   │   ├── adminController.js       # Dashboard thống kê
│   │
│   ├── routes/                       # ĐIỀU HƯỚNG (chỉ gọi controller)
│   │   ├── auth.js                  # POST /api/auth/*
│   │   ├── user.js                  # GET/PUT /api/users/*
│   │   ├── product.js               # CRUD /api/products/*
│   │   ├── category.js              # CRUD /api/categories/*
│   │   ├── order.js                 # CRUD /api/orders/*
│   │   ├── chat.js                  # CRUD /api/chat/*
│   │   ├── coupon.js                # CRUD /api/coupons/*
│   │   ├── review.js                # CRUD /api/reviews/*
│   │   ├── wishlist.js              # CRUD /api/wishlist/*
│   │   ├── notification.js          # CRUD /api/notifications/*
│   │   ├── momo.js                  # MoMo payment endpoints
│   │   ├── address.js               # CRUD /api/addresses/*
│   │   └── admin.js                 # Dashboard /api/admin/*
│   │
│   ├── models/                       # MONGOOSE SCHEMAS
│   │   ├── User.js                  # Tài khoản (local + OAuth)
│   │   ├── Product.js               # Sản phẩm
│   │   ├── Category.js              # Danh mục
│   │   ├── Order.js                 # Đơn hàng
│   │   ├── Coupon.js                # Mã giảm giá
│   │   ├── Review.js                # Đánh giá
│   │   ├── Wishlist.js              # Yêu thích
│   │   ├── Message.js               # Tin nhắn chat
│   │   ├── Notification.js           # Thông báo
│   │   └── Address.js               # Địa chỉ
│   │
│   ├── middlewares/
│   │   ├── auth.js                  # verifyToken, authorizeRoles
│   │   └── errorHandler.js          # Xử lý lỗi
│   │
│   ├── utils/
│   │   └── asyncHandler.js          # Wrapper async handler
│   │
│   ├── app.js                        # Express app (đăng ký routes)
│   ├── server.js                     # Entry point
│   └── package.json
│
├── frontend/                         # React SPA
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Navbar.jsx            # Thanh điều hướng
│   │   │   ├── Footer.jsx            # Footer
│   │   │   ├── ChatWidget.jsx        # Widget chat
│   │   │   ├── Carousel.jsx          # Banner carousel
│   │   │   ├── ProductFilterPanel.jsx # Bộ lọc sản phẩm
│   │   │   ├── ReviewSection.jsx     # Hiển thị đánh giá
│   │   │   └── ToastNotification.jsx # Toast messages
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.jsx          # Trang chủ
│   │   │   ├── ProductDetailPage.jsx # Chi tiết sản phẩm
│   │   │   ├── LoginPage.jsx         # Đăng nhập
│   │   │   ├── RegisterPage.jsx      # Đăng ký
│   │   │   ├── CartPage.jsx          # Giỏ hàng
│   │   │   ├── MyOrdersPage.jsx      # Đơn hàng của tôi
│   │   │   ├── WishlistPage.jsx      # Yêu thích
│   │   │   ├── UserProfilePage.jsx   # Tài khoản
│   │   │   ├── PaymentResultPage.jsx # Kết quả thanh toán
│   │   │   │
│   │   │   ├── Admin/
│   │   │   │   ├── AdminDashboard.jsx   # Dashboard
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
│   │   │   ├── services/                # API service layer
│   │   │   ├── api.js               # Axios instance + interceptors
│   │   │   ├── authService.js       # Auth API
│   │   │   ├── productService.js    # Sản phẩm
│   │   │   ├── orderService.js      # Đơn hàng
│   │   │   ├── momoService.js       # MoMo payment
│   │   │   ├── chatService.js        # Chat
│   │   │   └── ...
│   │   │
│   │   ├── config/
│   │   │   ├── sse.js               # SSE real-time service
│   │   │   └── firebase.js          # Firebase config (Google OAuth)
│   │   │
│   │   └── context/
│   │       ├── AuthContext.jsx      # Auth state
│   │       └── NotificationContext.jsx
│   │
│   ├── vercel.json
│   └── package.json
│
└── README.md
```

---

## 🏗️ Mô Hình Xử Lý

### Luồng Request-Response

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  Pages → Services (api.js) → HTTP Request                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/JSON
┌──────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js)                         │
│                                                              │
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

### Ví dụ cụ thể

#### 1. Route (Điều hướng)
```javascript
// routes/product.js
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', verifyToken, authorizeRoles('ADMIN', 'STAFF'), createProduct);
```

#### 2. Controller (Xử lý logic)
```javascript
// controllers/productController.js
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  res.json({ success: true, data: products });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.json({ success: true, data: product });
});
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

### 💬 Chat System
- Nhắn tin User ↔ Admin/Staff
- Badge số tin nhắn chưa đọc
- Real-time với SSE

### 🔔 Notification System
- Thông báo đơn hàng mới cho Admin
- Thông báo cập nhật trạng thái cho User
- Real-time với SSE

### 📊 Dashboard
| Role | Chức năng |
|------|-----------|
| **Admin** | Quản lý users, categories, products, orders, coupons, thống kê |
| **Staff** | Quản lý sản phẩm, xử lý đơn hàng |

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

### Chat
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/api/chat` | Danh sách cuộc trò chuyện | All |
| GET | `/api/chat/:userId` | Tin nhắn với 1 người | All |
| POST | `/api/chat` | Gửi tin nhắn | All |
| PUT | `/api/chat/read/:userId` | Đánh dấu đã đọc | All |
| DELETE | `/api/chat/message/:id` | Xóa tin nhắn | USER |
| DELETE | `/api/chat/conversation/:userId` | Xóa cuộc trò chuyện | USER |
| GET | `/api/chat/sse` | SSE real-time | All |

### Notifications
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/api/notifications` | Danh sách thông báo | All |
| GET | `/api/notifications/:id` | Chi tiết thông báo | All |
| PUT | `/api/notifications/:id/read` | Đánh dấu đã đọc | All |
| PUT | `/api/notifications/read-all` | Đánh dấu đã đọc tất cả | All |
| DELETE | `/api/notifications/:id` | Xóa thông báo | All |
| DELETE | `/api/notifications/read` | Xóa thông báo đã đọc | All |

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
VITE_API_BASE_URL=https://clothing-shop-api.onrender.com/api

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
   VITE_API_BASE_URL=https://clothing-shop-api.onrender.com/api
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
| `GET /api/orders/sse` | NEW_ORDER, ORDER_STATUS_CHANGED, new_notification |
| `GET /api/chat/sse` | new_message, reload_conversations |

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
- Exponential backoff khi reconnect (3s → 30s max)
- Polling fallback mỗi 30s cho notification bell

---

## 💾 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (nullable for OAuth),
  phone: String,
  address: String,
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
  salePrice: Number,
  category: ObjectId,
  images: [String],
  stock: Number,
  soldCount: Number,
  rating: Number,
  isActive: Boolean,
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
    image: String
  }],
  totalPrice: Number,
  finalPrice: Number,
  coupon: ObjectId,
  discount: Number,
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String
  },
  paymentMethod: 'COD' | 'MOMO',
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED',
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERING' | 'ARRIVED' | 'PAID_TO_SHIPPER' | 'COMPLETED' | 'CANCELLED',
  momoOrderId: String,
  momoTransId: String,
  createdAt: Date
}
```

### Message (Chat)
```javascript
{
  sender: ObjectId,
  receiver: ObjectId,
  content: String,
  image: String,
  messageType: 'text' | 'image',
  read: Boolean,
  createdAt: Date
}
```

### Coupon
```javascript
{
  code: String (unique),
  type: 'percentage' | 'fixed',
  value: Number,
  minOrderValue: Number,
  maxDiscount: Number,
  quantity: Number,
  usedCount: Number,
  startDate: Date,
  endDate: Date,
  isActive: Boolean
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
| Chat | ✅ | ✅ | ✅ |

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

## 📝 Ghi Chú

- **Không sử dụng MVC** theo yêu cầu: Routes và Controllers tách riêng
- Routes chỉ điều hướng (gọi controller)
- Controllers xử lý logic (không điều hướng)
- Real-time dùng SSE thay vì Socket.io (Render Free không hỗ trợ WebSocket)

---

**© 2026 - Clothing Shop Project**
