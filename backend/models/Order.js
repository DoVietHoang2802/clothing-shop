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
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
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
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
