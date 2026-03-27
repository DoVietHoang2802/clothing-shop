# MoMo UAT Payment Integration

## Giới thiệu

Tích hợp thanh toán MoMo UAT (User Acceptance Testing) - cho phép test thanh toán mà **không cần đăng ký tài khoản doanh nghiệp MoMo**.

## Credentials UAT

| Parameter | Value |
|-----------|-------|
| Partner Code | `MOMO` |
| Access Key | `F8BBA842ECF85` |
| Secret Key | `K951B6PE1waDMi640xX08PD3vg6EkVlz` |
| Endpoint | `https://test-payment.momo.vn` |

## Cách hoạt động

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. User chọn "Thanh toán MoMo" trong giỏ hàng                     │
│  2. Backend: Tạo order → Tạo signature HMAC SHA256                  │
│  3. Backend: POST /v2/gateway/api/create → Nhận payUrl             │
│  4. Frontend: Redirect sang trang QR MoMo                           │
│  5. User: Quét QR bằng App MoMo UAT                                │
│  6. MoMo: Redirect về redirectUrl với resultCode                   │
│  7. Backend: Xử lý callback                                       │
│     - resultCode = 0 → Cập nhật đơn hàng PAID                     │
│     - resultCode ≠ 0 → Hủy đơn + Hoàn stock                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Kết quả thanh toán (resultCode)

| Code | Ý nghĩa |
|------|---------|
| `0` | ✅ Thành công |
| `1006` | ❌ User hủy thanh toán |
| `1007` | ⏰ Timeout |

## Cài đặt App MoMo Test

1. Tải ứng dụng **MoMo** từ App Store (iOS) hoặc Google Play (Android)
2. Đăng ký tài khoản test (không cần liên kết ngân hàng)
3. Sử dụng số dư ảo để thanh toán test

## Files

### Backend
| File | Mô tả |
|------|--------|
| `backend/config/momo.js` | Config credentials MoMo |
| `backend/controllers/paymentController.js` | Xử lý tạo payment, callback |
| `backend/routes/momo.js` | Routes API |

### Frontend
| File | Mô tả |
|------|--------|
| `frontend/src/services/momoService.js` | Service gọi API MoMo |
| `frontend/src/pages/CartPage.jsx` | Thêm tùy chọn MoMo |
| `frontend/src/pages/PaymentResultPage.jsx` | Hiển thị kết quả |

## API Endpoints

### POST /api/momo/create
Tạo payment MoMo

**Request:**
```json
{
  "orderId": "69c6a5267ad6588eae99c71a"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payUrl": "https://test-payment.momo.vn/...",
    "orderId": "69c6a5267ad6588eae99c71a",
    "momoOrderId": "MOMO1774626089273"
  }
}
```

### POST /api/momo/ipn
IPN callback từ MoMo (server-to-server)

### GET /api/momo/return
Redirect URL sau khi user thanh toán

## Xử lý khi hủy thanh toán

Khi user hủy thanh toán (resultCode ≠ 0):
1. Hoàn stock sản phẩm
2. Xóa đơn hàng
3. Redirect về trang thất bại

## Production

Để chuyển sang MoMo Production:
1. Đăng ký merchant MoMo doanh nghiệp
2. Lấy credentials production từ MoMo Portal
3. Đổi `endpoint` từ `test-payment.momo.vn` → `payment.momo.vn`
4. Cập nhật credentials trong `config/momo.js`

---

**© 2026 - Clothing Shop Project**
