# 📊 KHUNG NỘI DUNG THUYẾT TRÌNH ĐỒ ÁN - CLOTHING SHOP

Tài liệu này cung cấp cấu trúc chi tiết từng slide để bạn làm bài thuyết trình (PowerPoint/Canva). Nội dung tập trung vào việc làm nổi bật kỹ năng lập trình **Full-stack Node.js** của bạn.

---

## 🎨 Layout & Hình ảnh (Gợi ý chung)
- **Tông màu chủ đạo:** Đen - Trắng - Xám (phong cách tối giản thời trang như Apple/Nike).
- **Font chữ:** Inter, Roboto hoặc Montserrat (không dùng Arial/Times New Roman).
- **Hình ảnh:** Chụp màn hình các tính năng đẹp nhất và cả code quan trọng (Snippet).

---

## 🏢 CẤU TRÚC CHI TIẾT (12 SLIDE)

### 📸 Slide 1: Trang tiêu đề
- **Tiêu đề:** Đồ án: Hệ thống Web Bán hàng Thời trang Full-stack
- **Công nghệ chính:** Node.js, React, MongoDB
- **Người thực hiện:** Đỗ Việt Hoàng
- **Giáo viên hướng dẫn:** [Tên thầy]

### 🎯 Slide 2: Đặt vấn đề & Mục tiêu
- **Vấn đề:** Nhu cầu mua sắm thời trang trực tuyến tăng cao, đòi hỏi hệ thống phải nhanh, ổn định và trải nghiệm mượt mà.
- **Mục tiêu:** Xây dựng website thương mại điện tử chuyên nghiệp, hỗ trợ thanh toán trực tuyến, quản lý tồn kho chính xác và tương tác real-time với khách hàng.

### 💻 Slide 3: Công nghệ sử dụng
- **Backend:** Node.js, Express.js (RESTful API).
- **Database:** MongoDB Atlas (Mongoose ODM).
- **Frontend:** React 18, Vite, Tailwind CSS/Bootstrap.
- **Security:** JWT (JSON Web Token), Google OAuth (Firebase Admin).
- **Real-time:** Server-Sent Events (SSE).
- **Tools:** Postman, Git, GitHub, Render, Vercel.

### 🏗️ Slide 4: Kiến trúc hệ thống & Database Model
- **Mô hình:** Client-Server Architecture. Web App tách biệt hoàn toàn với API Server.
- **Database:** Show sơ đồ quan hệ (ERD đơn giản): User ↔ Order ↔ Product ↔ Category.
- **Highlight:** Thiết kế Schema tối ưu cho mở rộng (e.g., hỗ trợ nhiều thuộc tính sản phẩm như Size, Color).

### 🛒 Slide 5: Tính năng cốt lõi (Khách hàng)
- **Danh sách sản phẩm:** Search case-insensitive, lọc theo giá, danh mục.
- **Giỏ hàng & Thanh toán:** Quy trình đặt hàng COD và MoMo mượt mà.
- **Tài khoản:** Quản lý lịch sử đơn hàng, địa chỉ, wishlist.

### ⚙️ Slide 6: Hệ thống Quản trị (Admin & Staff)
- **Dashboard:** Thống kê doanh thu, đơn hàng bằng biểu đồ trực quan.
- **Quản lý sản phẩm/danh mục:** CRUD đầy đủ với tính năng upload ảnh trực tiếp.
- **Phân quyền (RBAC):** Admin (tất cả quyền), Staff (chỉ quản lý kho và đơn hàng).

### 🚀 Slide 7: Giải pháp Real-time (Unified SSE)
- **Vấn đề:** Render Free tier chặn WebSockets.
- **Giải pháp cực mạnh:** Sử dụng Server-Sent Events (SSE) với kiến trúc "Unified Connection".
- **Lợi ích:** 1 kết nối duy nhất xử lý đồng thời: Thông báo đơn hàng mới, Chat Admin-User, Cập nhật trạng thái đơn hàng. Tiết kiệm tài nguyên và ổn định tuyệt đối.

### 🛡️ Slide 8: Xử lý Transaction & Tính toàn vẹn dữ liệu
- **Điểm nhấn kỹ thuật:** Áp dụng **Mongoose Transactions** trong logic Order.
- **Logic:** Khi một đơn hàng được tạo: Trừ tồn kho + Cập nhật lượt dùng Coupon + Lưu Order.
- **Cam kết:** Nếu bất kỳ bước nào lỗi (e.g., thanh toán thất bại), hệ thống tự động **Rollback** toàn bộ dữ liệu, đảm bảo không bao giờ bị sai lệch kho.

### 🔐 Slide 9: Bảo mật & Xác thực hiện đại
- **Authentication:** JWT với Refresh Token mechanism (tăng bảo mật, giảm lượt log out phiền phức).
- **OAuth 2.0:** Tích hợp Đăng nhập Google (Firebase Admin SDK) giúp tăng tỷ lệ chuyển đổi khách hàng.
- **Password Security:** Hashing bằng `bcryptjs` và cơ chế Reset Password qua token bảo mật.

### 📊 Slide 10: Tối ưu hiệu năng Backend
- **Aggregation Pipeline:** Sử dụng MongoDB Aggregation để tính điểm Rating trung bình và tổng lượt đánh giá ngay trong 1 query (tránh lỗi N+1).
- **Image Optimization:** Middleware Multer xử lý upload ảnh, đảm bảo tên file duy nhất và lưu trữ khoa học.
- **Centralized Error Handling:** Hệ thống bắt lỗi tập trung, trả về format JSON đồng nhất.

### 📱 Slide 11: Demo sản phẩm (Hình ảnh/Video)
- *Chụp 4 màn hình tiêu biểu:* Trang chủ, Chi tiết sản phẩm đẹp, Dashboard thống kê, Widget Chat Real-time.
- Chèn link website đã deploy (Render/Vercel) để thầy xem trực tiếp nếu cần.

### 🔚 Slide 12: Tổng kết & Hướng phát triển
- **Kết quả:** Hoàn thành các tính năng đề ra, hệ thống chạy ổn định, bảo mật tốt.
- **Bài học:** Cách thiết kế API chuẩn RESTful, cách xử lý bất đồng bộ, cách tối ưu DB.
- **Hướng tới:** Tích hợp AI khuyến nghị sản phẩm (Recommendation System), Mobile App (React Native).

---
**© 2026 - Đồ án Clothing Shop - Đỗ Việt Hoàng**
