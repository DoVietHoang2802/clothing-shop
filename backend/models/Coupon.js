const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    minlength: [3, 'Mã giảm giá phải ít nhất 3 ký tự'],
  },
  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED'],
    default: 'PERCENTAGE',
  },
  discountValue: {
    type: Number,
    required: true,
    min: [0, 'Giảm giá không được âm'],
  },
  // Nếu PERCENTAGE: 10 = 10%, nếu FIXED: 50000 = 50k VND
  minOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Giá trị đơn hàng tối thiểu không được âm'],
  },
  maxDiscount: {
    type: Number,
    default: null, // Không giới hạn nếu null
  },
  usageLimit: {
    type: Number,
    default: null, // Không giới hạn nếu null
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Coupon', couponSchema);
