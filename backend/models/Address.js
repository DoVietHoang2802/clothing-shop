/**
 * Address Model - Địa chỉ giao hàng của user
 */

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  ward: {
    type: String,
    trim: true,
    default: '',
  },
  district: {
    type: String,
    trim: true,
    default: '',
  },
  city: {
    type: String,
    trim: true,
    default: '',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    enum: ['home', 'office', 'other'],
    default: 'home',
  },
}, {
  timestamps: true,
});

// Index for faster queries
addressSchema.index({ user: 1 });

// Middleware: Khi set default = true, unset other defaults
addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('Address', addressSchema);
