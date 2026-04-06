# Session Notes - Clothing Shop Project

## 📅 Ngày: 2026-04-01 (Buổi 2)

---

## 🎯 Mục tiêu buổi làm việc

Fix bug chat SSE - Admin không nhận được tin nhắn từ User.

---

## 🐛 Bug đã fix

### Tình trạng trước
- User gửi tin nhắn → Admin không thấy
- Tất cả admin đều không thấy trong danh sách cuộc trò chuyện
- SSE Connected nhưng không có event nào được nhận

### Root Cause - 2 nguyên nhân

#### 1. Backend: 2 Map SSE riêng biệt
- `chatController.js` dùng `sseClients` Map riêng
- `orderSSEController.js` dùng `sseClients` Map riêng
- User gửi chat → broadcast vào Map A
- Admin connect → đọc từ Map B
- → Không bao giờ gặp nhau!

#### 2. Frontend: user._id vs user.id
- `AuthContext.jsx` lưu user với field `id` (không có `_`)
- `ChatWidget.jsx` đọc `user._id` (có `_`) → luôn là `undefined`
- JWT payload: `{ id: "...", role: "USER" }` (không phải `_id`)

---

## ✅ Fix đã làm

### Backend
1. **`orderSSEController.js`**:
   - Giữ nguyên `sseClients` Map (Map CHÍNH)
   - Thêm `broadcastChatMessage()` export ra ngoài
   - Chat SSE endpoint cùng dùng Map với Order SSE

2. **`chatController.js`**:
   - Import `sseClients` từ `orderSSEController.js` (dùng chung Map)
   - Thay `broadcastToAll()` → `broadcastChatMessage()`
   - Xóa Map riêng của chat

### Frontend
1. **`ChatWidget.jsx`**:
   - `user._id` → `user.id` (4 chỗ)
   - Thêm `.toString()` cho so sánh ObjectId
   - Xử lý cả event types cũ và mới

---

## 📁 File đã thay đổi

| File | Thay đổi |
|------|----------|
| `backend/controllers/orderSSEController.js` | Thêm `broadcastChatMessage()`, export `sseClients` |
| `backend/controllers/chatController.js` | Import unified SSE, xóa Map riêng |
| `frontend/src/components/ChatWidget.jsx` | Fix `user._id` → `user.id`, xử lý event types |

---

## 🧪 Test thành công

```
[SSE] User: 69c8ced... Role: USER
[SSE] User: 69b132e... Role: ADMIN
[SSE] User: 69abe9e... Role: ADMIN
→ Cả 3 admin đều nhận được tin nhắn từ user ✅
```

---

## ⚠️ Lưu ý cho thầy

1. **Không phải MVC** - Routes và Controllers tách riêng
2. **SSE Unified**: Chat + Orders dùng chung 1 Map (`orderSSEController.js`)
3. **user.id vs user._id**: AuthContext lưu `id`, không phải `_id`
4. **Event Types**: Xử lý cả `chat_new_message` và `new_message` để tương thích

---

## 🔧 Còn cần làm

### 1. Fix Mixed Content (ảnh sản phẩm)
Vào **Render Dashboard → backend → Environment** → thêm:
```
API_PROTOCOL = https
```
Deploy lại → ảnh sẽ trả về `https://`

### 2. Kiểm tra notification SSE
Notification cũng dùng unified `sseClients` → cần test thực tế

---

## 📅 Ngày: 2026-04-01 (Buổi 1)

---

## 🎯 Mục tiêu buổi làm việc

Dọn dẹp dự án, đảm bảo code đúng chuẩn (Routes ≠ Controllers), và cập nhật README.

---

## ✅ Những gì đã làm

### 1. Dọn dẹp file rác
- Xóa `backend/controllers/mockPaymentController.js` (VNPay mock không dùng)
- Xóa `frontend/src/config/socket.js` (Socket.io không dùng, dùng SSE)
- Xóa `backend/routes/payment.js` (import controller đã xóa)

### 2. Tách Routes ≠ Controllers
- Tạo `backend/controllers/adminController.js` (mới)
- Thêm `getNotificationById` vào `notificationController.js`
- Sửa `routes/admin.js` - bỏ inline handler
- Sửa `routes/notification.js` - bỏ inline handler
- Sửa `routes/chat.js` - bỏ inline JWT verify

### 3. Cập nhật README
- Mô hình xử lý chi tiết
- API Endpoints đầy đủ
- Cấu hình .env
- Database Models
- Deployment guide
- SSE Architecture

### 4. Push lên GitHub
- Commit: `refactor: separate routes from controllers`
- Commit: `docs: update README with detailed project documentation`

---

## 📋 Nguyên tắc code đã xác nhận

### ✅ Cấu trúc đúng (không phải MVC)

```
routes/*.js    → ĐIỀU HƯỚNG (chỉ gọi controller)
controllers/*.js → XỬ LÝ LOGIC (không điều hướng)
```

### ✅ SSE thay vì Socket.io
- Render Free không hỗ trợ WebSocket
- Dùng SSE cho: Orders, Notifications, Chat
- **SSE Unified**: Dùng chung 1 Map từ `orderSSEController.js`

### ✅ API không thay đổi
- Chỉ tách code từ route → controller
- Endpoints giữ nguyên

---

## 🔧 Deploy History

| Lần | Mục đích |
|-----|----------|
| 1 | Initial setup |
| 2 | Routes/Controllers separation |
| 3 | Chat SSE bug fix (2 Map → 1 Map + user.id fix) |

---

**End of session**
