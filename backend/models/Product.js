const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Giá không được âm'],
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Tồn kho không được âm'],
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300x300?text=No+Image',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
