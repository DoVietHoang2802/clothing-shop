# 🔥 HƯỚNG DẪN TÍCH HỢP MOMO UAT - COPY QUA DỰ ÁN KHÁC

## MỤC LỤC
1. [Giới thiệu](#giới-thiệu)
2. [Credentials UAT](#credentials-uat)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Order Model Update](#order-model-update)
6. [CartPage Update](#cartpage-update)
7. [PaymentResultPage Update](#paymentresultpage-update)
8. [Cách Test](#cách-test)
9. [Production Mode](#production-mode)

---

## Giới thiệu

MoMo UAT cho phép test thanh toán **KHÔNG CẦN** đăng ký tài khoản doanh nghiệp MoMo.

### Luồng hoạt động:
```
User chọn MoMo → Tạo order (ẩn) → Redirect sang QR MoMo
    ↓
User quét QR bằng App MoMo Test
    ↓
Thành công (resultCode=0) → Hiện đơn + Thanh toán PAID
Hủy/Thất bại → Xóa đơn + Hoàn stock
```

---

## Credentials UAT

### File: `backend/config/momo.js` (TẠO MỚI)

```javascript
/**
 * MoMo Payment Config - UAT Environment
 */

module.exports = {
  // UAT Endpoint - Test không cần merchant
  endpoint: 'https://test-payment.momo.vn',
  partnerCode: 'MOMO',
  accessKey: 'F8BBA842ECF85',
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',

  // Redirect URLs - ĐỔI THÀNH URL DỰ ÁN CỦA BẠN
  redirectUrl: 'https://your-frontend-domain.vercel.app/payment-result',
  ipnUrl: 'https://your-backend-domain.onrender.com/api/momo/ipn',
};
```

---

## Backend Setup

### 1. Cài axios (nếu chưa có)
```bash
cd backend
npm install axios
```

### 2. File: `backend/controllers/paymentController.js` (TẠO MỚI)

```javascript
/**
 * Payment Controller - MoMo UAT Payment Integration
 */

const crypto = require('crypto');
const axios = require('axios');
const momoConfig = require('../config/momo');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// Tạo signature HMAC SHA256
const createSignature = (rawSignature) => {
  return crypto
    .createHmac('sha256', momoConfig.secretKey)
    .update(rawSignature)
    .digest('hex');
};

// Build raw signature string
const buildRawSignature = (data) => {
  return `accessKey=${momoConfig.accessKey}&amount=${data.amount}&extraData=${data.extraData}&ipnUrl=${data.ipnUrl}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${data.redirectUrl}&requestId=${data.requestId}&requestType=${data.requestType}`;
};

// @desc    Tạo payment MoMo
// @route   POST /api/momo/create
// @access  Private
const createPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const userId = req.user.id;

  const order = await Order.findById(orderId).populate('user', 'name email');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy đơn hàng',
      data: null,
    });
  }

  if (order.user._id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thanh toán đơn hàng này',
      data: null,
    });
  }

  if (order.paymentStatus === 'PAID') {
    return res.status(400).json({
      success: false,
      message: 'Đơn hàng đã được thanh toán',
      data: null,
    });
  }

  const requestId = `MOMO${Date.now()}`;
  const momoOrderId = requestId;
  const amount = order.finalPrice.toString();
  const orderInfo = `thanh toan don hang ${order._id}`;

  const signatureData = {
    amount,
    extraData: '',
    ipnUrl: momoConfig.ipnUrl,
    orderId: momoOrderId,
    orderInfo,
    redirectUrl: momoConfig.redirectUrl,
    requestId,
    requestType: 'captureWallet',
  };

  const rawSignature = buildRawSignature(signatureData);
  const signature = createSignature(rawSignature);

  const requestBody = {
    partnerCode: momoConfig.partnerCode,
    partnerName: 'Your Shop Name',
    storeId: 'YourStoreId',
    requestId,
    amount,
    orderId: momoOrderId,
    orderInfo,
    redirectUrl: momoConfig.redirectUrl,
    ipnUrl: momoConfig.ipnUrl,
    lang: 'vi',
    requestType: 'captureWallet',
    extraData: '',
    autoCapture: true,
    signature,
  };

  try {
    const response = await axios.post(
      `${momoConfig.endpoint}/v2/gateway/api/create`,
      requestBody,
      { headers: { 'Content-Type': 'application/json' } }
    );

    order.momoOrderId = momoOrderId;
    order.momoRequestId = requestId;
    await order.save();

    if (response.data.payUrl) {
      return res.status(200).json({
        success: true,
        message: 'Tạo payment thành công',
        data: {
          payUrl: response.data.payUrl,
          orderId: order._id,
          momoOrderId,
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: response.data.message || 'Tạo payment thất bại',
      data: null,
    });
  } catch (error) {
    console.error('MoMo API Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi kết nối MoMo',
      data: error.response?.data || null,
    });
  }
});

// @desc    IPN - Server-to-server callback từ MoMo
// @route   POST /api/momo/ipn
const ipnCallback = asyncHandler(async (req, res) => {
  const { resultCode, transId, message, orderInfo } = req.body;

  console.log('=== MoMo IPN Callback ===');
  console.log('ResultCode:', resultCode);

  if (resultCode == 0) {
    const orderIdMatch = orderInfo.match(/thanh toan don hang (.+)/i);
    if (orderIdMatch) {
      const dbOrderId = orderIdMatch[1];
      try {
        const order = await Order.findById(dbOrderId);
        if (order && order.paymentStatus !== 'PAID') {
          order.paymentStatus = 'PAID';
          order.paymentMethod = 'MOMO';
          order.momoTransId = transId;
          order.momoMessage = message;
          order.paidAt = new Date();
          await order.save();
          console.log('✅ Payment success:', dbOrderId);
        }
      } catch (err) {
        console.error('Error updating order:', err);
      }
    }
  }

  res.status(200).json({ status: 'SUCCESS' });
});

// @desc    Return URL - User redirect sau khi thanh toán
// @route   GET /api/momo/return
const returnCallback = asyncHandler(async (req, res) => {
  const { resultCode, orderInfo, message } = req.query;

  console.log('=== MoMo Return Callback ===');
  console.log('ResultCode:', resultCode);

  const orderIdMatch = orderInfo ? orderInfo.match(/thanh toan don hang (.+)/i) : null;

  if (resultCode == 0) {
    return res.redirect(`${momoConfig.redirectUrl}?status=success`);
  } else {
    // Hủy = Xóa đơn + Hoàn stock
    if (orderIdMatch) {
      const dbOrderId = orderIdMatch[1];
      try {
        const order = await Order.findById(dbOrderId);
        if (order && order.paymentStatus !== 'PAID') {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: item.quantity } },
              { new: true }
            );
          }
          await Order.findByIdAndDelete(dbOrderId);
          console.log('✅ Order cancelled, stock restored:', dbOrderId);
        }
      } catch (err) {
        console.error('Error cancelling order:', err);
      }
    }
    const errorMessage = encodeURIComponent(message || 'Thanh toán bị hủy');
    return res.redirect(`${momoConfig.redirectUrl}?status=failed&code=${resultCode}&message=${errorMessage}`);
  }
});

module.exports = { createPayment, ipnCallback, returnCallback };
```

### 3. File: `backend/routes/momo.js` (TẠO MỚI)

```javascript
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { createPayment, ipnCallback, returnCallback } = require('../controllers/paymentController');

router.post('/create', verifyToken, createPayment);
router.post('/ipn', ipnCallback);
router.get('/return', returnCallback);

module.exports = router;
```

### 4. Cập nhật: `backend/app.js`

Thêm vào phần import:
```javascript
const momoRoutes = require('./routes/momo');
```

Thêm vào phần routes:
```javascript
app.use('/api/momo', momoRoutes);
```

---

## Order Model Update

### File: `backend/models/Order.js`

Thêm vào schema:
```javascript
// Thông tin thanh toán
paymentMethod: {
  type: String,
  enum: ['COD', 'VNPAY', 'MOMO'],  // Thêm MOMO
  default: 'COD',
},
paymentStatus: {
  type: String,
  enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
  default: 'PENDING',
},

// MoMo specific fields
momoOrderId: String,
momoRequestId: String,
momoTransId: String,
momoMessage: String,
paidAt: Date,
```

---

## Frontend Setup

### 1. File: `frontend/src/services/momoService.js` (TẠO MỚI)

```javascript
import api from './api';

const momoService = {
  createPayment: async (orderId) => {
    const response = await api.post('/momo/create', { orderId });
    return response;
  },
};

export default momoService;
```

### 2. File: `frontend/src/pages/CartPage.jsx`

Thêm import:
```javascript
import momoService from '../services/momoService';
```

Thêm state payment method:
```javascript
const [paymentMethod, setPaymentMethod] = useState('COD');
```

Thêm xử lý MoMo trong `handleCheckout`:
```javascript
// Sau khi tạo order thành công
const orderId = orderRes.data.data._id;

// Nếu là MoMo
if (paymentMethod === 'MOMO') {
  try {
    const momoRes = await momoService.createPayment(orderId);
    if (momoRes.data.success && momoRes.data.data.payUrl) {
      window.location.href = momoRes.data.data.payUrl;
      return;
    }
  } catch (payErr) {
    setError(payErr.response?.data?.message || 'Lỗi MoMo');
    setLoading(false);
    return;
  }
}
```

Thêm nút MoMo vào UI (trong phần chọn payment method):
```javascript
{/* MoMo Option */}
<label style={{
  flex: 1,
  padding: '1rem',
  border: paymentMethod === 'MOMO' ? '2px solid #a50064' : '2px solid #ddd',
  borderRadius: '8px',
  cursor: 'pointer',
  background: paymentMethod === 'MOMO' ? '#fff5f8' : 'white',
  textAlign: 'center'
}}>
  <input
    type="radio"
    name="paymentMethod"
    value="MOMO"
    checked={paymentMethod === 'MOMO'}
    onChange={(e) => setPaymentMethod(e.target.value)}
    style={{ display: 'none' }}
  />
  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💜</div>
  <div style={{ fontWeight: '600', color: '#2c3e50' }}>MoMo</div>
  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Thanh toán qua MoMo</div>
</label>
```

Cập nhật button text:
```javascript
{loading ? '⏳ Đang Xử Lý...' :
  paymentMethod === 'COD' ? '📦 Đặt Hàng (COD)' :
  paymentMethod === 'MOMO' ? '💜 Thanh Toán MoMo' :
  '💳 Thanh Toán VNPay'}
```

---

## PaymentResultPage Update

### File: `frontend/src/pages/PaymentResultPage.jsx`

Cập nhật để nhận callback từ MoMo:
```javascript
// Trong component:
const status = searchParams.get('status');
const resultCode = searchParams.get('resultCode');
const isMomoSuccess = resultCode === '0';
const isSuccess = status === 'success' || isMomoSuccess;

// Trong phần hiển thị:
<h2 style={{ color: isSuccess ? '#27ae60' : '#e74c3c' }}>
  {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
</h2>

// Hiển thị phương thức MoMo:
{orderData.paymentMethod === 'MOMO' ? 'MoMo' : 'VNPay'}
```

---

## Order Controller Update

### File: `backend/controllers/orderController.js`

Ẩn đơn MoMo đang chờ trong `getMyOrders`:
```javascript
const getMyOrders = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const orders = await Order.find({
    user: userId,
    $or: [
      { paymentStatus: 'PAID' },
      { paymentMethod: 'COD' },
      { paymentStatus: { $ne: 'PENDING' } }
    ]
  })
    .populate('user', 'name email')
    .populate('items.product', 'name price image')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách đơn hàng thành công',
    data: orders || [],
  });
});
```

---

## Cách Test

### 1. Cài App MoMo Test
- Tải MoMo từ App Store / Google Play
- Đăng ký tài khoản (không cần liên kết ngân hàng)
- Sử dụng số dư ảo trong app

### 2. Test Flow
1. Login với user
2. Thêm sản phẩm vào giỏ
3. Chọn **MoMo** 💜 làm phương thức
4. Nhấn **"Thanh Toán MoMo"**
5. Redirect sang trang QR MoMo
6. Quét QR bằng App MoMo
7. Xác nhận thanh toán

### 3. Kết quả test
| Action | Kết quả |
|--------|---------|
| Thanh toán thành công | Hiện trong "Đơn hàng của tôi" |
| Hủy thanh toán | Đơn bị xóa, không hiện |
| Đóng cửa sổ | Đơn bị xóa, không hiện |

### 4. Result Codes
| Code | Ý nghĩa |
|------|---------|
| 0 | ✅ Thành công |
| 1006 | ❌ User hủy |
| 1007 | ⏰ Timeout |

---

## Production Mode

### Khi nào cần Production?
- Website đã hoạt động thật
- Có tài khoản MoMo Merchant

### Cách chuyển sang Production:

1. **Đăng ký MoMo Merchant:**
   - Truy cập: https://business.momo.vn
   - Đăng ký tài khoản doanh nghiệp
   - Lấy credentials production

2. **Cập nhật `config/momo.js`:**
```javascript
module.exports = {
  endpoint: 'https://payment.momo.vn',  // Đổi từ test-payment.momo.vn
  partnerCode: 'YOUR_PRODUCTION_PARTNER_CODE',
  accessKey: 'YOUR_PRODUCTION_ACCESS_KEY',
  secretKey: 'YOUR_PRODUCTION_SECRET_KEY',
  redirectUrl: 'https://your-domain.com/payment-result',
  ipnUrl: 'https://your-domain.com/api/momo/ipn',
};
```

3. **HTTPS bắt buộc:**
   - Backend phải có SSL (HTTPS)
   - Frontend phải có SSL (HTTPS)

---

## Checklist Copy Sang Dự Án Khác

- [ ] Tạo `backend/config/momo.js`
- [ ] Tạo `backend/controllers/paymentController.js`
- [ ] Tạo `backend/routes/momo.js`
- [ ] Cập nhật `backend/app.js` (thêm momoRoutes)
- [ ] Cập nhật `backend/models/Order.js` (thêm MOMO fields)
- [ ] Cập nhật `getMyOrders` (ẩn đơn pending)
- [ ] Tạo `frontend/src/services/momoService.js`
- [ ] Cập nhật `CartPage.jsx` (thêm nút MoMo)
- [ ] Cập nhật `PaymentResultPage.jsx`
- [ ] Cài `npm install axios` ở backend
- [ ] Cập nhật redirectUrl/ipnUrl cho đúng domain

---

**© 2026 - Clothing Shop Project**
