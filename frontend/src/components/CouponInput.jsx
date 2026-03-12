import { useState } from 'react';
import couponService from '../services/couponService';
import './CouponInput.css';

export default function CouponInput({ orderTotal, onCouponApplied, onCouponRemoved }) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!couponCode.trim()) {
      setError('Vui lòng nhập mã coupon');
      return;
    }

    if (!orderTotal || orderTotal <= 0) {
      setError('Giỏ hàng trống, không thể áp dụng coupon');
      return;
    }

    setLoading(true);

    try {
      const res = await couponService.validateCoupon(couponCode, orderTotal);
      setAppliedCoupon(res.data);
      setSuccess(`✅ Mã coupon hợp lệ! Tiết kiệm: ${new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(res.data.discountAmount)}`);

      if (onCouponApplied) {
        onCouponApplied(res.data);
      }

      setCouponCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xác thực coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setError(null);
    setSuccess(null);

    if (onCouponRemoved) {
      onCouponRemoved();
    }
  };

  return (
    <div className="coupon-input-container">
      <h3 className="coupon-title">🎟️ Mã Giảm Giá</h3>

      {appliedCoupon ? (
        <div className="coupon-applied">
          <div className="applied-info">
            <div className="coupon-code-badge">
              <span className="code">{appliedCoupon.coupon.code}</span>
            </div>
            <div className="coupon-details">
              <p className="discount-type">
                {appliedCoupon.coupon.discountType === 'PERCENTAGE'
                  ? `Giảm ${appliedCoupon.coupon.discountValue}%`
                  : `Giảm ${new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(appliedCoupon.coupon.discountValue)}`}
              </p>
              <p className="discount-amount">
                -{' '}
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(appliedCoupon.discountAmount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="btn-remove-coupon"
            title="Xóa mã coupon"
          >
            ✕
          </button>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className="coupon-form">
          <div className="input-group">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã coupon..."
              className="coupon-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !couponCode.trim()}
              className="btn-apply"
            >
              {loading ? '⏳' : '✓'}
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
        </form>
      )}
    </div>
  );
}
