import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import CouponInput from '../components/CouponInput';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    // Thông báo cho navbar và các component khác cập nhật lại số lượng
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = (productId, quantity) => {
    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getFinalTotal = () => {
    if (appliedCoupon) {
      return appliedCoupon.finalTotal;
    }
    return getTotalPrice();
  };

  const getDiscountAmount = () => {
    if (appliedCoupon) {
      return appliedCoupon.discountAmount;
    }
    return 0;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Giỏ hàng trống');
      return;
    }

    const items = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    try {
      setLoading(true);
      setError('');
      await orderService.createOrder(items, appliedCoupon?.code);
      setSuccess('Tạo đơn hàng thành công!');
      localStorage.removeItem('cart');
      setCart([]);
      setAppliedCoupon(null);
      setTimeout(() => navigate('/my-orders'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Tạo đơn hàng thất bại');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCouponApplied = (couponData) => {
    setAppliedCoupon(couponData);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  return (
    <div className="container">
      <h1>🛒 Giỏ Hàng</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {cart.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Giỏ hàng trống</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            ← Tiếp Tục Mua Sắm
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          {/* Cart Items */}
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>Sản Phẩm</th>
                  <th>Giá</th>
                  <th>Số Lượng</th>
                  <th>Thành Tiền</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.productId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        {item.name}
                      </div>
                    </td>
                    <td>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.price)}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.productId, parseInt(e.target.value))
                        }
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.price * item.quantity)}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => removeItem(item.productId)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="card">
            <h3>Tóm Tắt Đơn Hàng</h3>

            {/* Coupon Input */}
            <CouponInput 
              orderTotal={getTotalPrice()} 
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
            />

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Tổng Tiền:</span>
                <strong>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(getTotalPrice())}
                </strong>
              </div>

              {getDiscountAmount() > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#27ae60' }}>
                  <span>Giảm Giá:</span>
                  <strong>-{new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(getDiscountAmount())}</strong>
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '1.5rem', 
                paddingTop: '1rem',
                borderTop: '2px solid #ecf0f1',
                fontSize: '1.1rem'
              }}>
                <span>Thành Tiền:</span>
                <strong style={{ color: '#ff6b35' }}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(getFinalTotal())}
                </strong>
              </div>

              <button
                className="btn btn-success"
                style={{ width: '100%', padding: '1rem' }}
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Đang Xử Lý...' : 'Thanh Toán'}
              </button>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
                onClick={() => navigate('/products')}
              >
                Tiếp Tục Mua Sắm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
