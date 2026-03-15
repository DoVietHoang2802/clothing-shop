cd d:\\DOAN.NNUDM\\clothing-shop ; cat > README.md <<'EOF'

\# 👕 Clothing Shop - Full Stack Application



Một hệ thống web bán quần áo fullstack với backend Node.js/Express/MongoDB và frontend React/Vite.



\## 🚀 Tổng quan

\- Backend: RESTful API với Node.js + Express + MongoDB + JWT.

\- Frontend: React + Vite + React Router + Axios.

\- Quản lý 3 vai trò: USER / STAFF / ADMIN.

\- Chức năng: sản phẩm, danh mục, giỏ hàng, đơn hàng, đánh giá, wishlist, coupon.



\## 📁 Cấu trúc dự án

\\`\\`\\`

clothing-shop/

├── backend/

│   ├── app.js

│   ├── server.js

│   ├── package.json

│   ├── config/

│   │   ├── connectDB.js

│   │   ├── db.js

│   │   └── firebase.js

│   ├── controllers/

│   ├── middlewares/

│   ├── models/

│   ├── routes/

│   └── utils/

└── frontend/

&#x20;   ├── package.json

&#x20;   ├── vite.config.js

&#x20;   ├── public/

&#x20;   └── src/

&#x20;       ├── App.jsx

&#x20;       ├── main.jsx

&#x20;       ├── index.css

&#x20;       ├── components/

&#x20;       ├── context/

&#x20;       ├── layouts/

&#x20;       ├── pages/

&#x20;       ├── routes/

&#x20;       └── services/

\\`\\`\\`



\## 🧭 Công nghệ sử dụng

\- \*\*Backend\*\*: Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, dotenv

\- \*\*Frontend\*\*: React 18, Vite, React Router, Axios

\- \*\*Triển khai\*\*: Render (backend), Vercel (frontend)

\- \*\*Thiết kế\*\*: RESTful API, backend tách theo models/controllers/routes (MVC-style)



\## ⚙️ Cách chạy local

\### 1) Backend

\\`\\`\\`bash

cd backend

npm install

cp .env.example .env

\# chỉnh MONGO\_URI, JWT\_SECRET trong .env

npm run dev

\\`\\`\\`

Server sẽ chạy tại: `http://localhost:5000`



\### 2) Frontend

\\`\\`\\`bash

cd frontend

npm install

npm run dev

\\`\\`\\`

Frontend sẽ chạy tại: `http://localhost:5173` (hoặc `3000`).



\### 3) Test API đơn giản

\- `GET http://localhost:5000/api/health`

\- `GET http://localhost:5000/api/products`



\## 🔐 Quyền hạn

\- \*\*USER\*\*: xem sản phẩm, thêm giỏ hàng, tạo đơn hàng, xem profile

\- \*\*STAFF\*\*: USER + quản lý sản phẩm + cập nhật trạng thái đơn hàng

\- \*\*ADMIN\*\*: STAFF + quản lý người dùng + quản lý danh mục + đặt lại đơn hàng



\## 📦 API chính

\- `POST /api/auth/register`

\- `POST /api/auth/login`

\- `GET /api/products`

\- `GET /api/categories`

\- `GET /api/orders` (với role)

\- `POST /api/wishlist`

\- `POST /api/coupons`



\## ✅ Lưu ý điểm yêu cầu môn

\- Backend chuẩn \*\*RESTful API\*\*.

\- Backend có mẫu \*\*models/controllers/routes\*\* nên đúng mô hình tổ chức.

\- Không dùng render view engine (MVC frontend server-side) => đúng yêu cầu.

\- Frontend React chỉ cần chức năng đúng, không cần giao diện đẹp.



\## 📁 Tài liệu thêm

\- Backend API docs: `backend/README.md`

\- Frontend docs: `frontend/README.md`



\---

© 2026 Clothing Shop Project

