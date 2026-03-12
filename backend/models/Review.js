const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating phải từ 1-5'],
    max: [5, 'Rating phải từ 1-5'],
  },
  comment: {
    type: String,
    required: true,
    minlength: [10, 'Bình luận phải có ít nhất 10 ký tự'],
    maxlength: [500, 'Bình luận không được vượt 500 ký tự'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
