# 📤 Git & GitHub Guide - Clothing Shop

## 📋 Mục Đích

Hướng dẫn cách push code lên GitHub để:
- Lưu trữ code an toàn (backup)
- Cộng tác với team
- Tracking changes
- Dễ dàng deploy

---

## 🔧 Setup Ban Đầu (Lần Đầu Tiên)

### 1️⃣ Tạo Repository Trên GitHub

1. Truy cập [github.com](https://github.com)
2. Nhấn **"New"** (nút xanh)
3. Đặt tên: `clothing-shop`
4. Mô tả: `Fullstack Clothing Shop Application`
5. Chọn **"Public"** (hoặc Private nếu không muốn ai thấy)
6. ⚠️ **KHÔNG** chọn "Initialize with README" (vì ta đã có code)
7. Nhấn **"Create repository"**

GitHub sẽ cho bạn các lệnh để push code.

---

### 2️⃣ Cấu Hình Git Lần Đầu (Chỉ Làm 1 Lần)

Mở **Git Bash** hoặc Terminal, chạy:

```bash
# Cấu hình tên (sẽ hiển thị trên commit)
git config --global user.name "Tên của bạn"

# Cấu hình email
git config --global user.email "email@example.com"

# Xác nhận cấu hình
git config --global --list
```

**Ví dụ:**
```bash
git config --global user.name "Hoàng Ví Việt"
git config --global user.email "hoang@example.com"
```

---

### 3️⃣ Bước Push Lần Đầu

Trong thư mục `d:\DOAN.NNUDM\clothing-shop`, chạy các lệnh:

```bash
# 1. Khởi tạo git repository
git init

# 2. Thêm tất cả file vào staging area
git add -A

# 3. Tạo commit đầu tiên
git commit -m "Initial commit: Fullstack Clothing Shop"

# 4. Đổi tên branch chính thành 'main' (nếu cần)
git branch -M main

# 5. Thêm remote repository GitHub (thay <username>/<repo> bằng của bạn)
git remote add origin https://github.com/<username>/<repo>.git

# 6. Push lên GitHub
git push -u origin main
```

**Ví dụ đầy đủ:**
```bash
cd d:\DOAN.NNUDM\clothing-shop

git init
git add -A
git commit -m "Initial commit: Fullstack Clothing Shop"
git branch -M main
git remote add origin https://github.com/hoangvivietnguyen/clothing-shop.git
git push -u origin main
```

✅ Xong! Code đã trên GitHub.

---

## 🔄 Cách Push Code Khi Có Changes (Sau Lần Đầu)

Sau khi cập nhật code, chỉ cần 3 bước:

### 1️⃣ Xem Status (optional)
```bash
git status
```

Sẽ hiển thị những file được modify, delete, new.

---

### 2️⃣ Thêm Changes Vào Staging

**Cách 1: Thêm tất cả**
```bash
git add -A
```

**Cách 2: Thêm file cụ thể**
```bash
git add backend/app.js
git add frontend/src/App.jsx
```

---

### 3️⃣ Tạo Commit

```bash
git commit -m "Mô tả thay đổi"
```

**Ví dụ tốt:**
```bash
git commit -m "Add product filter by category"
git commit -m "Fix auth token validation bug"
git commit -m "Update API documentation"
```

**Ví dụ không tốt:**
```bash
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

---

### 4️⃣ Push Lên GitHub

```bash
git push origin main
```

Nếu GitHub hỏi credential, nhập username & password (hoặc token).

---

## 📝 Ví Dụ Quy Trình Hoàn Chỉnh

### Kịch Bản: Cập nhật API Documentation

```bash
# 1. Vào thư mục project
cd d:\DOAN.NNUDM\clothing-shop

# 2. Xem file thay đổi
git status

# Output:
# Untracked files:
#   API_DOCUMENTATION.md
# Modified:
#   backend/routes/product.js

# 3. Thêm vào staging
git add -A

# 4. Tạo commit
git commit -m "Add comprehensive API documentation for all endpoints"

# 5. Push lên GitHub
git push origin main

# Output:
# To https://github.com/hoangvivietnguyen/clothing-shop.git
#    a1b2c3d..e4f5g6h  main -> main
```

✅ Xong! Các thay đổi đã được push lên GitHub.

---

## 🌿 Làm Việc Với Branches (Tuỳ Chọn)

Nếu bạn muốn tạo branch riêng cho feature:

### Tạo Branch Mới
```bash
# Tạo branch mới từ main
git checkout -b feature/add-coupon

# Hoặc (Git 2.23+)
git switch -c feature/add-coupon
```

### Làm Việc Trên Branch
```bash
# Thêm, commit như bình thường
git add -A
git commit -m "Implement coupon system"
git push -u origin feature/add-coupon
```

### Merge Về Main (Tạo Pull Request)
Trên GitHub, tạo Pull Request (PR):
1. Vào repo → "Pull requests" → "New pull request"
2. Base: `main`, Compare: `feature/add-coupon`
3. Thêm mô tả & nhấn "Create pull request"
4. Review code rồi merge

---

## 🔐 Xác Thực GitHub (SSH vs HTTPS)

### Cách 1: HTTPS (Đơn Giản)
```bash
git remote add origin https://github.com/username/repo.git
```

Lần đầu push, GitHub hỏi credentials. Bạn có thể:
- Dùng password GitHub (deprecated)
- Tạo Personal Access Token (PAT)

### Cách 2: SSH (An Toàn Hơn)

1. Tạo SSH key:
```bash
ssh-keygen -t ed25519 -C "email@example.com"
```

2. Thêm vào GitHub:
- Vào **Settings** → **SSH and GPG keys** → **New SSH key**
- Paste nội dung file `~/.ssh/id_ed25519.pub`

3. Dùng SSH remote:
```bash
git remote add origin git@github.com:username/repo.git
```

---

## 📋 Commit Message Best Practices

### Format Tốt
```
Type: Mô tả ngắn gọn

- Chi tiết 1
- Chi tiết 2

Fix #123  (nếu fix bug từ issue #123)
```

### Types
- **feat**: Tính năng mới
- **fix**: Sửa bug
- **docs**: Cập nhật documentation
- **style**: Format code (không thay logic)
- **refactor**: Sắp xếp lại code
- **test**: Thêm tests
- **chore**: Update dependencies, config

### Ví Dụ
```
feat: Add coupon system to reduce order total

- Create Coupon model in database
- Implement coupon validation logic
- Add apply coupon endpoint
- Update order calculation

Fix #42
```

---

## 🔍 Lệnh Git Hữu Ích Khác

### Xem Lịch Sử Commit
```bash
git log
git log --oneline
git log --oneline -n 5
```

### Xem Thay Đổi
```bash
git diff                    # Compare working directory vs staging
git diff --staged           # Compare staging vs last commit
git diff HEAD               # Compare working vs last commit
```

### Hoàn Tác Changes
```bash
git restore <file>          # Hoàn tác changes trong file
git restore --staged <file> # Remove file khỏi staging
git reset --soft HEAD~1     # Undo commit cuối, keep changes
git reset --hard HEAD~1     # Undo commit cuối, discard changes
```

### Clone Code Từ GitHub
```bash
git clone https://github.com/username/repo.git
cd repo
```

---

## 🚀 Quick Reference

```bash
# Setup lần đầu
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Push code
cd d:\DOAN.NNUDM\clothing-shop
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/username/clothing-shop.git
git branch -M main
git push -u origin main

# Workflow hàng ngày
git status
git add -A
git commit -m "Message"
git push

# Xem lịch sử
git log --oneline -10
```

---

## ⚠️ Lỗi Thường Gặp

### Error: "Permission denied (publickey)"
**Giải pháp:** Dùng HTTPS hoặc setup SSH key đúng cách.

### Error: "failed to push"
```bash
# Kéo changes từ remote trước
git pull origin main
# Rồi push lại
git push origin main
```

### Error: ".gitignore không hoạt động"
```bash
# Clear cache & thêm lại
git rm -r --cached .
git add -A
git commit -m "Apply gitignore"
```

---

## 📚 Tài Liệu Thêm

- [GitHub Docs](https://docs.github.com)
- [Git Book](https://git-scm.com/book)
- [GitHub Desktop](https://desktop.github.com) - GUI alternative

---

**Chúc bạn thành công! 🎉**

Nếu có vấn đề, check console output hoặc Google error message.
