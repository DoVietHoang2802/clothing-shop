# 👕 Clothing Shop - Full Stack Application

Hệ thống web bán quần áo theo kiến trúc Fullstack với Node.js, Express, MongoDB (Backend) và React, Vite (Frontend).

## 🚀 Live Demo

- **Frontend**: https://clothing-shop-ashy.vercel.app
- **Backend API**: https://clothing-shop-api-8wae.onrender.com/api

## 📁 Cấu Trúc Thư Mục

```
clothing-shop/
├── backend/                    # Node.js + Express + MongoDB API
│   ├── config/                 # Cấu hình (firebase, vnpay)
│   ├── controllers/            # Logic xử lý API
│   ├── models/                 # Schema database
│   ├── routes/                # Định nghĩa API routes
│   ├── middlewares/           # Middleware (auth, error handling)
│   ├── utils/                 # Hàm tiện ích
│   ├── server.js              # Entry point
│   └── .env                   # Environment variables
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Context (Auth, Notification)
│   │   ├── layouts/           # Layout components
│   │   ├── pages/             # Page components
│   │   │   ├── Admin/         # Admin pages
│   │   │   ├── Staff/         # Staff pages
│   │   │   └── *.jsx          # User pages
│   │   ├── services/          # API service layer
│   │   ├── config/            # Firebase config
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   └── .env.local             # Environment variables
│
└── README.md                  # This file
```

## ✨ Tính Năng Đã Implement

### 🔐 Authentication & Authorization
- Đăng ký / Đăng nhập (local)
- Đăng nhập bằng Google (Firebase OAuth)
- JWT Token authentication
- 3 vai trò: `USER`, `STAFF`, `ADMIN`
- Protected routes

### 📦 Quản Lý Sản Phẩm
- Tạo, chỉnh sửa, xóa sản phẩm
- Quản lý hình ảnh sản phẩm
- Quản lý tồn kho (stock)
- Phân loại sản phẩm theo danh mục
- Filter theo danh mục, tìm kiếm

### 📂 Quản Lý Danh Mục (Categories)
- CRUD danh mục (ADMIN only)

### 🛒 Giỏ Hàng & Đơn Hàng
- Thêm sản phẩm vào giỏ hàng
- Cập nhật số lượng, xóa sản phẩm
- Áp dụng mã giảm giá (coupon)
- Tạo đơn hàng từ giỏ hàng

### 💳 Thanh Toán (Mock Payment)
- **Thanh toán khi nhận hàng (COD)**
- **Thanh toán online giả lập (Mock VNPay)**
- Trạng thái thanh toán: `UNPAID`, `PAID`

### 📋 Quản Lý Đơn Hàng
- **Luồng trạng thái đơn hàng:**
  ```
  PENDING → CONFIRMED → SHIPPED → DELIVERING → ARRIVED → PAID_TO_SHIPPER → COMPLETED
       ↓                                    ↓
    CANCELLED                          (hoặc CANCELLED)
  ```
- User xem đơn hàng của mình
- User hủy đơn (chỉ PENDING, CONFIRMED)
- User xóa đơn (chỉ COMPLETED, PAID_TO_SHIPPER, CANCELLED)
- Admin/Staff cập nhật trạng thái
- Admin/Staff khóa đơn hoàn thành (không sửa được nữa)
- Lọc đơn hàng theo trạng thái
- Sắp xếp theo ngày mới nhất

### 💰 Hệ Thống Rút Tiền (Mock Withdrawal)
- User xem số dư khả dụng
- User tạo yêu cầu rút tiền
- Admin duyệt/từ chối rút tiền
- Auto approve cho mock

### 💬 Chat System (Giống Messenger)
- User gửi tin nhắn cho Admin/Staff
- Admin/Staff xem danh sách cuộc trò chuyện
- Tin nhắn chưa đọc có badge đếm
- Sắp xếp theo tin nhắn mới nhất
- Auto refresh mỗi 5 giây

### ⭐ Đánh Giá Sản Phẩm
- User đánh giá sản phẩm (rating 1-5 sao)
- Viết review
- Xem trung bình rating sản phẩm

### ❤️ Yêu Thích (Wishlist)
- Thêm/xóa sản phẩm yêu thích
- Xem danh sách yêu thích

### 📊 Dashboard
- **Admin Dashboard**: Thống kê tổng quan, quản lý users, categories, products, orders, coupons, withdrawals
- **Staff Dashboard**: Quản lý sản phẩm và đơn hàng

---

## 🔗 API Endpoints Documentation

### Base URL: `https://clothing-shop-api-8wae.onrender.com/api`

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/auth/register` | Đăng ký tài khoản | ❌ | - |
| POST | `/auth/login` | Đăng nhập | ❌ | - |
| POST | `/auth/google` | Đăng nhập Google | ✅ | - |
| GET | `/auth/me` | Lấy thông tin user hiện tại | ✅ | All |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/users/profile` | Lấy profile user | ✅ | USER, STAFF, ADMIN |
| PUT | `/users/profile` | Cập nhật profile | ✅ | USER, STAFF, ADMIN |
| DELETE | `/users/:id` | Xóa user | ✅ | ADMIN |

### Categories (`/api/categories`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/categories` | Lấy tất cả danh mục | ❌ | - |
| POST | `/categories` | Tạo danh mục | ✅ | ADMIN |
| PUT | `/categories/:id` | Cập nhật danh mục | ✅ | ADMIN |
| DELETE | `/categories/:id` | Xóa danh mục | ✅ | ADMIN |

### Products (`/api/products`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/products` | Lấy tất cả sản phẩm | ❌ | - |
| GET | `/products/:id` | Lấy chi tiết sản phẩm | ❌ | - |
| POST | `/products` | Tạo sản phẩm | ✅ | ADMIN, STAFF |
| PUT | `/products/:id` | Cập nhật sản phẩm | ✅ | ADMIN, STAFF |
| DELETE | `/products/:id` | Xóa sản phẩm | ✅ | ADMIN |

### Orders (`/api/orders`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/orders` | Tạo đơn hàng mới | ✅ | USER, STAFF, ADMIN |
| GET | `/orders/my` | Lấy đơn hàng của tôi | ✅ | USER, STAFF, ADMIN |
| GET | `/orders` | Lấy tất cả đơn hàng | ✅ | ADMIN, STAFF |
| GET | `/orders/:id` | Lấy chi tiết đơn hàng | ✅ | USER, ADMIN, STAFF |
| PUT | `/orders/:id/status` | Cập nhật trạng thái | ✅ | ADMIN, STAFF |
| PUT | `/orders/:id/cancel` | Hủy đơn hàng | ✅ | USER, ADMIN, STAFF |
| PUT | `/orders/:id/paid-to-shipper` | Xác nhận đã trả tiền cho shipper | ✅ | USER |
| DELETE | `/orders/:id` | Xóa đơn hàng (của mình) | ✅ | USER, STAFF |
| DELETE | `/orders/admin/:id` | Xóa đơn hàng (admin) | ✅ | ADMIN |

**Order Status Flow:**
```
PENDING → CONFIRMED → SHIPPED → DELIVERING → ARRIVED → PAID_TO_SHIPPER → COMPLETED
   ↓                                    ↓
CANCELLED                            CANCELLED
```

### Reviews (`/api/reviews`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/reviews/product/:productId` | Lấy reviews của sản phẩm | ❌ | - |
| GET | `/reviews/product/:productId/average` | Lấy rating trung bình | ❌ | - |
| POST | `/reviews` | Tạo review | ✅ | USER |
| PUT | `/reviews/:id` | Cập nhật review | ✅ | USER |
| DELETE | `/reviews/:id` | Xóa review | ✅ | USER, ADMIN |

### Wishlist (`/api/wishlist`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/wishlist` | Lấy danh sách yêu thích | ✅ | USER, STAFF, ADMIN |
| POST | `/wishlist/:productId` | Thêm vào yêu thích | ✅ | USER, STAFF, ADMIN |
| DELETE | `/wishlist/:productId` | Xóa khỏi yêu thích | ✅ | USER, STAFF, ADMIN |

### Coupons (`/api/coupons`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/coupons` | Lấy tất cả mã giảm giá | ❌ | - |
| POST | `/coupons` | Tạo mã giảm giá | ✅ | ADMIN |
| PUT | `/coupons/:id` | Cập nhật mã giảm giá | ✅ | ADMIN |
| DELETE | `/coupons/:id` | Xóa mã giảm giá | ✅ | ADMIN |
| POST | `/coupons/validate` | Validate mã giảm giá | ✅ | USER |

### Payment (`/api/payment`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/payment/create-mock` | Tạo thanh toán mock | ✅ | USER |
| GET | `/payment/mock/:orderId` | Trang thanh toán mock | ✅ | USER |
| POST | `/payment/confirm-mock` | Xác nhận thanh toán mock | ✅ | USER |

### Withdrawal (`/api/withdrawals`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/withdrawals` | Tạo yêu cầu rút tiền | ✅ | USER |
| GET | `/withdrawals/my` | Lịch sử rút tiền của tôi | ✅ | USER |
| GET | `/withdrawals/balance` | Lấy số dư khả dụng | ✅ | USER |
| GET | `/withdrawals` | Lấy tất cả yêu cầu rút tiền | ✅ | ADMIN |
| PUT | `/withdrawals/:id/status` | Cập nhật trạng thái | ✅ | ADMIN |

### Chat (`/api/chat`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/chat/send` | Gửi tin nhắn | ✅ | All |
| GET | `/chat/:userId` | Lấy tin nhắn với user | ✅ | All |
| GET | `/chat/conversations/all` | Lấy danh sách cuộc trò chuyện | ✅ | All |
| GET | `/chat/users/list` | Lấy danh sách admin/staff | ✅ | All |
| PUT | `/chat/read/:userId` | Đánh dấu đã đọc | ✅ | All |
| GET | `/chat/unread/count` | Lấy số tin nhắn chưa đọc | ✅ | All |

### Admin Stats (`/api/admin`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/admin/stats` | Lấy thống kê tổng quan | ✅ | ADMIN |

---

## 🧪 Testing Guide

### 1. Test Authentication

```bash
# Register
curl -X POST https://clothing-shop-api-8wae.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# Login
curl -X POST https://clothing-shop-api-8wae.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Get Token from response and use for subsequent requests
```

### 2. Test Products

```bash
# Get all products
curl https://clothing-shop-api-8wae.onrender.com/api/products

# Create product (需要 admin/staff token)
curl -X POST https://clothing-shop-api-8wae.onrender.com/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Product","price":100000,"stock":10,"category":"CATEGORY_ID"}'
```

### 3. Test Orders

```bash
# Create order
curl -X POST https://clothing-shop-api-8wae.onrender.com/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items":[{"product":"PRODUCT_ID","quantity":2}],
    "shippingAddress":{"name":"Nguyen Van A","phone":"0123456789","address":"123 ABC"},
    "paymentMethod":"COD"
  }'

# Get my orders
curl https://clothing-shop-api-8wae.onrender.com/api/orders/my \
  -H "Authorization: Bearer YOUR_TOKEN"

# Cancel order (only PENDING)
curl -X PUT https://clothing-shop-api-8wae.onrender.com/api/orders/ORDER_ID/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Chat

```bash
# Send message
curl -X POST https://clothing-shop-api-8wae.onrender.com/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"receiverId":"ADMIN_USER_ID","content":"Hello Admin!"}'

# Get conversations
curl https://clothing-shop-api-8wae.onrender.com/api/chat/conversations/all \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get unread count
curl https://clothing-shop-api-8wae.onrender.com/api/chat/unread/count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Test Withdrawal

```bash
# Get balance
curl https://clothing-shop-api-8wae.onrender.com/api/withdrawals/balance \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create withdrawal request
curl -X POST https://clothing-shop-api-8wae.onrender.com/api/withdrawals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "amount":50000,
    "bankName":"Vietcombank",
    "accountNumber":"1234567890",
    "accountHolder":"Nguyen Van A"
  }'
```

---

## 👥 User Roles & Permissions

| Feature | USER | STAFF | ADMIN |
|---------|:----:|:-----:|:-----:|
| Xem sản phẩm | ✅ | ✅ | ✅ |
| Giỏ hàng | ✅ | ✅ | ✅ |
| Đặt hàng | ✅ | ✅ | ✅ |
| Xem đơn hàng của mình | ✅ | ✅ | ✅ |
| Hủy đơn (PENDING/CONFIRMED) | ✅ | ✅ | ✅ |
| Xóa đơn (COMPLETED/CANCELLED) | ✅ | ✅ | ✅ |
| Review sản phẩm | ✅ | ✅ | ✅ |
| Wishlist | ✅ | ✅ | ✅ |
| Chat với admin | ✅ | ✅ | ✅ |
| Tạo/sửa sản phẩm | ❌ | ✅ | ✅ |
| Xóa sản phẩm | ❌ | ❌ | ✅ |
| Cập nhật trạng thái đơn | ❌ | ✅ | ✅ |
| Xem tất cả đơn hàng | ❌ | ✅ | ✅ |
| CRUD danh mục | ❌ | ❌ | ✅ |
| CRUD coupon | ❌ | ❌ | ✅ |
| CRUD users | ❌ | ❌ | ✅ |
| Quản lý withdrawal | ❌ | ❌ | ✅ |
| Xem thống kê | ❌ | ✅ | ✅ |

---

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication token
- **bcryptjs** - Password hashing
- **Firebase Admin SDK** - Google OAuth

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Firebase SDK** - Google OAuth
- **Vanilla CSS** - Styling

---

## 📋 Database Schema (Updated)

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed, nullable for OAuth),
  role: 'USER' | 'STAFF' | 'ADMIN',
  provider: 'local' | 'google',
  providerId: String (OAuth ID),
  avatar: String (URL),
  createdAt: Date
}
```

### Product
```javascript
{
  name: String,
  description: String,
  price: Number,
  stock: Number,
  images: [String],
  category: ObjectId (ref Category),
  createdAt: Date
}
```

### Order
```javascript
{
  user: ObjectId (ref User),
  items: [{
    product: ObjectId (ref Product),
    quantity: Number,
    price: Number
  }],
  totalPrice: Number,
  finalPrice: Number (sau khi giảm giá),
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERING' | 'ARRIVED' | 'PAID_TO_SHIPPER' | 'COMPLETED' | 'CANCELLED',
  paymentMethod: 'COD' | 'ONLINE',
  paymentStatus: 'UNPAID' | 'PAID',
  shippingAddress: {
    name: String,
    phone: String,
    address: String
  },
  coupon: ObjectId (ref Coupon),
  createdAt: Date
}
```

### Message (Chat)
```javascript
{
  sender: ObjectId (ref User),
  receiver: ObjectId (ref User),
  content: String,
  read: Boolean (default: false),
  createdAt: Date
}
```

### Withdrawal
```javascript
{
  user: ObjectId (ref User),
  amount: Number,
  bankName: String,
  accountNumber: String,
  accountHolder: String,
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED',
  note: String,
  processedAt: Date,
  createdAt: Date
}
```

---

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/clothing_shop
JWT_SECRET=your_secret_key_here
FIREBASE_SERVICE_ACCOUNT_PATH=backend/serviceAccountKey.json
# Hoặc
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🚀 Deployment

### Backend (Render)
1. Connect GitHub repo to Render
2. Build command: `npm run start`
3. Start command: `node server.js`
4. Add environment variables in Render dashboard

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables in Vercel dashboard

---

## ✅ Development History

### Phase 1: Basic Setup
- [x] Project structure
- [x] Backend Express setup
- [x] MongoDB connection
- [x] React + Vite setup

### Phase 2: Core Features
- [x] User authentication (register/login)
- [x] JWT authentication
- [x] Role-based access control
- [x] Product CRUD
- [x] Category CRUD
- [x] Cart management
- [x] Order creation

### Phase 3: Enhanced Features
- [x] Google OAuth (Firebase)
- [x] Order status management
- [x] COD payment flow
- [x] Mock payment (VNPay simulation)
- [x] Review system
- [x] Wishlist

### Phase 4: Advanced Features
- [x] Withdrawal system (mock)
- [x] Chat system (Messenger-like)
- [x] Admin dashboard stats
- [x] Staff dashboard
- [x] Order completion locking
- [x] Order deletion

---

## 📞 Support

**Made with ❤️ for learning fullstack development**

For questions, please refer to the API documentation above or check the source code.
