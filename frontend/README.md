# Clothing Shop - Frontend

React + Vite Frontend Application

## ⚙️ Cài Đặt

### 1. Cài Đặt Dependencies
```bash
npm install
```

### 2. Chạy Frontend
```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

## 📦 Build

```bash
npm run build
```

## 🏗️ Cấu Trúc Project

```
src/
├── components/      # React components
│   ├── Navbar.jsx
│   └── ...
├── pages/          # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── CartPage.jsx
│   ├── MyOrdersPage.jsx
│   ├── ProductDetailPage.jsx
│   ├── Admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminUsersPage.jsx
│   │   ├── AdminCategoriesPage.jsx
│   │   ├── AdminProductsPage.jsx
│   │   └── AdminOrdersPage.jsx
│   └── Staff/
│       └── StaffProductsPage.jsx
├── services/       # API services
│   ├── api.js
│   ├── authService.js
│   ├── productService.js
│   ├── categoryService.js
│   ├── orderService.js
│   └── userService.js
├── context/        # React Context
│   └── AuthContext.jsx
├── layouts/        # Layout components
│   └── MainLayout.jsx
├── routes/         # Route components
│   └── PrivateRoute.jsx
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## 🔐 Authentication

- Token được lưu trong localStorage
- Tự động đính kèm vào request headers
- AuthContext quản lý trạng thái đăng nhập
- PrivateRoute bảo vệ các trang cần quyền

## 👥 User Roles

### USER (Người Dùng Thường)
- Xem danh sách sản phẩm
- Xem chi tiết sản phẩm
- Thêm sản phẩm vào giỏ hàng
- Tạo đơn hàng
- Xem đơn hàng của mình

### STAFF (Nhân Viên)
- Tất cả quyền của USER
- Quản lý sản phẩm (tạo, chỉnh sửa)
- Quản lý đơn hàng (cập nhật trạng thái)

### ADMIN (Quản Trị)
- Tất cả quyền của STAFF
- Quản lý người dùng
- Quản lý danh mục sản phẩm
- Dashboard quản trị

## 🛠️ Công Nghệ

- React 18 - UI library
- Vite - Build tool
- React Router - Routing
- Axios - HTTP client

## 📱 Pages

### Public Pages
- **Home Page** - Hiển thị danh sách sản phẩm, lọc theo danh mục
- **Product Detail** - Chi tiết sản phẩm, thêm vào giỏ
- **Login Page** - Đăng nhập
- **Register Page** - Đăng ký

### User Pages
- **My Orders** - Xem đơn hàng của tôi
- **Cart Page** - Giỏ hàng, thanh toán

### Staff Pages
- **Product Management** - Quản lý sản phẩm

### Admin Pages
- **Dashboard** - Bảng điều khiển
- **User Management** - Quản lý người dùng
- **Category Management** - Quản lý danh mục
- **Product Management** - Quản lý sản phẩm
- **Order Management** - Quản lý đơn hàng

## 🎨 Styling

Toàn bộ styling được khai báo trong `src/index.css` với CSS vanilla:
- CSS Grid
- CSS Flexbox
- Responsive design
- Utilities classes (btn, card, container, etc.)

## 🚀 Deployment

Deploy frontend với:
- Vercel: `vercel deploy`
- Netlify: `netlify deploy`
- GitHub Pages
- AWS S3 + CloudFront

Đảm bảo API URL được cấu hình đúng trong `src/services/api.js`
