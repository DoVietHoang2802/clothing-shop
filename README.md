# 👕 Clothing Shop - Full Stack Application

Hệ thống web bán quần áo theo kiến trúc Fullstack với Node.js, Express, MongoDB (Backend) và React, Vite (Frontend).

## 📁 Cấu Trúc Thư Mục

```
clothing-shop/
├── backend/          # Node.js + Express + MongoDB API
└── frontend/         # React + Vite
```

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Cập nhật .env với MongoDB URI
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000`

## ✨ Tính Năng

### 🔐 Authentication & Authorization
- Đăng ký / Đăng nhập
- JWT Token authentication
- 3 vai trò: USER, STAFF, ADMIN
- Protected routes

### 📦 Quản Lý Sản Phẩm
- Tạo, chỉnh sửa, xóa sản phẩm
- Phân loại sản phẩm theo danh mục
- Xem chi tiết sản phẩm
- Filter theo danh mục

### 📂 Quản Lý Danh Mục
- CRUD danh mục sản phẩm (ADMIN only)

### 🛒 Giỏ Hàng & Đơn Hàng
- Thêm sản phẩm vào giỏ hàng
- Quản lý giỏ hàng (update, delete)
- Tạo đơn hàng từ giỏ hàng
- Xem trạng thái đơn hàng
- Cập nhật trạng thái đơn hàng (ADMIN, STAFF)

### 👥 Quản Lý Người Dùng
- Xem danh sách người dùng (ADMIN)
- Xóa người dùng (ADMIN)

### 📊 Dashboard Admin
- Quản lý toàn bộ hệ thống
- 4 module chính: Users, Categories, Products, Orders

## 👥 User Roles & Permissions

### USER (Người Dùng Thường)
✅ Xem sản phẩm & danh mục
✅ Tạo & xem đơn hàng của mình
✅ Quản lý giỏ hàng

### STAFF (Nhân Viên)
✅ Tất cả quyền của USER
✅ Quản lý sản phẩm (tạo, chỉnh sửa)
✅ Cập nhật trạng thái đơn hàng

### ADMIN (Quản Trị)
✅ Tất cả quyền của STAFF
✅ Quản lý người dùng
✅ Quản lý danh mục
✅ Xem tất cả đơn hàng

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication token
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Vanilla CSS** - Styling

## 📋 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'USER' | 'STAFF' | 'ADMIN',
  createdAt: Date
}
```

### Category
```javascript
{
  name: String (unique),
  description: String,
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
  image: String,
  category: ObjectId (ref Category),
  createdAt: Date
}
```

### Order
```javascript
{
  user: ObjectId (ref User),
  items: [
    {
      product: ObjectId (ref Product),
      quantity: Number,
      price: Number
    }
  ],
  totalPrice: Number,
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED',
  createdAt: Date
}
```

## 📚 API Response Format

Tất cả endpoint đều trả về format thống nhất:

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## 🔗 API Endpoints

Xem chi tiết tại:
- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## 🎨 UI Features

- ✨ Clean & modern design
- 📱 Responsive layout (mobile, tablet, desktop)
- 🎯 Intuitive navigation
- 📊 Admin dashboard
- 🛒 Shopping cart functionality
- 🔔 Status notifications
- 📋 Order management interface

## 📄 Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/clothing_shop
JWT_SECRET=your_secret_key_here
```

### Frontend
API base URL: `http://localhost:5000/api` (configured in `src/services/api.js`)

## 🚀 Deployment

### Backend
Tải lên các dịch vụ hosting:
- Heroku, Railway, Render, Fly.io
- AWS EC2, DigitalOcean
- Azure, Google Cloud

Cần:
- Node.js environment
- MongoDB database
- Environment variables

### Frontend
Tải lên:
- Vercel, Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📝 Development Notes

- Code rõ ràng, dễ hiểu
- Comments cho logic phức tạp
- CSS utilities để tái sử dụng styles
- Error handling tập trung ở Backend
- Token tự động renew (có thể mở rộng)

## 📞 Support

Để hiểu rõ hơn, xem README riêng:
- Backend: `cd backend && README.md`
- Frontend: `cd frontend && README.md`

## ✅ Checklist Hoàn Thành

- [x] Backend cấu hình
- [x] Models tất cả
- [x] Controllers tất cả
- [x] Routes tất cả
- [x] Authentication & Authorization
- [x] Frontend cấu hình
- [x] Components (Navbar, PrivateRoute)
- [x] Services (API clients)
- [x] Pages (Public, User, Staff, Admin)
- [x] Context (AuthContext)
- [x] Styling (Responsive CSS)

---

**Made with ❤️ for learning fullstack development**
