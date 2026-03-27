const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      size: String,
      color: String,
      _id: false,
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Tổng tiền không được âm'],
  },
  coupon: {
    code: String,
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
    },
    discountValue: Number,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  // Thông tin vận chuyển
  shippingAddress: {
    fullName: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  // Thông tin thanh toán
  paymentMethod: {
    type: String,
    enum: ['COD', 'VNPAY', 'MOMO'],
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
  // Trạng thái đơn hàng
  // Flow: PENDING → SHIPPING → PAID_TO_SHIPPER → COMPLETED
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERING', 'ARRIVED', 'PAID_TO_SHIPPER', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
  },
  // Thông báo đã hiển thị cho user
  notificationSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
