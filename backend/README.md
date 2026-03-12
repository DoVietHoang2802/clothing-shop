# Clothing Shop - Backend

NodeJS + Express + MongoDB RESTful API

## ⚙️ Cài Đặt

### 1. Cài Đặt Dependencies
```bash
npm install
```

### 2. Cấu Hình Environment
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Chỉnh sửa `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/clothing_shop
JWT_SECRET=your_secret_key_here
```

### 3. Chạy Backend
```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Users (ADMIN only)
- `GET /api/users` - Lấy tất cả người dùng
- `DELETE /api/users/:id` - Xóa người dùng

### Categories
- `GET /api/categories` - Lấy tất cả danh mục (Public)
- `POST /api/categories` - Tạo danh mục (ADMIN)
- `PUT /api/categories/:id` - Cập nhật danh mục (ADMIN)
- `DELETE /api/categories/:id` - Xóa danh mục (ADMIN)

### Products
- `GET /api/products` - Lấy tất cả sản phẩm (Public)
- `GET /api/products/:id` - Lấy chi tiết sản phẩm (Public)
- `POST /api/products` - Tạo sản phẩm (ADMIN, STAFF)
- `PUT /api/products/:id` - Cập nhật sản phẩm (ADMIN, STAFF)
- `DELETE /api/products/:id` - Xóa sản phẩm (ADMIN)

### Orders
- `POST /api/orders` - Tạo đơn hàng (USER, STAFF, ADMIN)
- `GET /api/orders/my` - Lấy đơn hàng của tôi (USER, STAFF, ADMIN)
- `GET /api/orders` - Lấy tất cả đơn hàng (ADMIN)
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (ADMIN, STAFF)

## 👥 Roles

- **USER** - Người dùng thường
  - Xem sản phẩm, danh mục
  - Tạo đơn hàng, xem đơn hàng của mình

- **STAFF** - Nhân viên
  - Quản lý sản phẩm (tạo, chỉnh sửa)
  - Cập nhật trạng thái đơn hàng
  - Xem đơn hàng của mình

- **ADMIN** - Quản trị viên
  - Quản lý người dùng
  - Quản lý danh mục
  - Quản lý sản phẩm
  - Quản lý đơn hàng

## 🛠️ Công Nghệ

- Express.js - Web framework
- Mongoose - MongoDB ODM
- JWT - Authentication
- bcryptjs - Password hashing
- Cors - CORS middleware
- Dotenv - Environment variables

## 📝 Response Format

Tất cả API response đều theo format:
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## 🚀 Deployment

Để deploy, bạn cần:
1. MongoDB Atlas (hoặc MongoDB instance)
2. Heroku, Netlify, AWS, hoặc hosting khác
3. Cấu hình environment variables trên hosting
