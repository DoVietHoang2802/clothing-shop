# 🚀 Quick Start Guide

## Yêu Cầu
- Node.js >= 14
- MongoDB (local hoặc MongoDB Atlas)

## 1️⃣ Backend Setup (5 phút)

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo .env từ .env.example
copy .env.example .env
# Hoặc trên macOS/Linux: cp .env.example .env

# Chỉnh sửa .env nếu cần (đặc biệt MONGO_URI)
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/clothing_shop
# JWT_SECRET=my_secret_key

# Chạy server
npm run dev
```

✅ Backend sẽ chạy tại: **http://localhost:5000**

## 2️⃣ Frontend Setup (5 phút)

Mở terminal mới:

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
```

✅ Frontend sẽ chạy tại: **http://localhost:3000**

## 3️⃣ Kiểm Tra

Mở browser: http://localhost:3000

Bạn sẽ thấy trang chủ của Clothing Shop.

## 4️⃣ Tạo Test Data

### Test Accounts

**Admin (Quản Trị)**
- Email: admin@test.com
- Password: admin123

**Staff (Nhân Viên)**
- Email: staff@test.com
- Password: staff123

**User (Người Dùng)**
- Email: user@test.com
- Password: user123

> **Note:** Ban đầu không có accounts này, bạn cần đăng ký trước. Sau đó có thể update role trong MongoDB.

### Hoặc Insert Vào MongoDB

```javascript
// Mở MongoDB shell hoặc Compass

db.users.insertMany([
  {
    name: "Admin User",
    email: "admin@test.com",
    password: "$2a$10/...", // bcrypt hash của 'admin123'
    role: "ADMIN"
  },
  {
    name: "Staff User",
    email: "staff@test.com",
    password: "$2a$10/...",
    role: " "
  },
  {
    name: "Regular User",
    email: "user@test.com",
    password: "$2a$10/...",
    role: "USER"
  }
])
```

## 🎯 Workflow

1. **Đăng ký / Đăng nhập** trên Frontend
2. **Xem sản phẩm** - Danh sách sản phẩm mặc định trống (thêm từ Admin)
3. **Admin Dashboard** - Quản lý danh mục, sản phẩm, người dùng, đơn hàng
4. **Thêm sản phẩm** - Admin → Quản Lý Sản Phẩm → Thêm Sản Phẩm
5. **Mua hàng** - User xem sản phẩm → Giỏ hàng → Thanh toán
6. **Quản lý đơn** - Admin xem & cập nhật trạng thái

## 📝 Cấp Admin Cho User

Nếu muốn promote user thành admin:

**Cách 1: MongoDB Atlas/Compass**
```javascript
db.users.updateOne(
  { email: "user@test.com" },
  { $set: { role: "ADMIN" } }
)
```

**Cách 2: Frontend Register**
- Đăng ký tài khoản thường (role = USER)
- Update thành ADMIN qua MongoDB

## 🐛 Troubleshooting

### Backend không chạy
- Kiểm tra MongoDB có chạy không: `mongod`
- Port 5000 có conflicts?
- Check `.env` - MONGO_URI đúng chưa?

### Frontend không kết nối Backend
- Backend có chạy? (http://localhost:5000/api/health)
- Check `src/services/api.js` - baseURL đúng?
- Browser console xem có error gì?

### Không thấy sản phẩm
- Admin cần tạo Category trước
- Admin tạo Product
- Refresh page

## 📚 Resources

- Backend API: [backend/README.md](./backend/README.md)
- Frontend Docs: [frontend/README.md](./frontend/README.md)
- Main Docs: [README.md](./README.md)

## ✨ Features Demo

### Public Pages
- [x] Home - Danh sách sản phẩm + filter danh mục
- [x] Login/Register
- [x] Product Detail

### User Pages
- [x] Cart - Quản lý giỏ hàng
- [x] My Orders - Xem đơn hàng

### Admin Pages
- [x] Dashboard - Tổng quan
- [x] Users - CRUD người dùng
- [x] Categories - CRUD danh mục
- [x] Products - CRUD sản phẩm
- [x] Orders - Xem & cập nhật trạng thái

### Staff Pages
- [x] Products - Tạo & sửa sản phẩm

## 🎉 Enjoy!

Bạn đã sẵn sàng sử dụng Clothing Shop!

Có vấn đề gì? Check README files hoặc console để debug.

---

**Happy coding! 💻**
