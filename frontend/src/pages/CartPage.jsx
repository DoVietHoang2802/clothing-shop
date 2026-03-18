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

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('COD');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
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

    // Validate shipping address for COD
    if (paymentMethod === 'COD') {
      if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
        setError('Vui lòng nhập đầy đủ thông tin giao hàng');
        return;
      }

      // Validate phone number
      if (!/^0\d{9}$/.test(shippingAddress.phone)) {
        setError('Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 số)');
        return;
      }
    }

    const items = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    try {
      setLoading(true);
      setError('');

      // Tạo đơn hàng trước
      const orderRes = await orderService.createOrder(
        items,
        appliedCoupon?.code,
        paymentMethod === 'COD' ? shippingAddress : null,
        paymentMethod
      );

      const orderId = orderRes.data.data._id;

      // Nếu là VNPay, chuyển sang trang thanh toán
      if (paymentMethod === 'VNPAY') {
        try {
          const paymentRes = await import('../services/paymentService').then(module =>
            module.default.createVNPayPayment(orderId)
          );

          if (paymentRes.data.success && paymentRes.data.data.paymentUrl) {
            // Redirect đến VNPay
            window.location.href = paymentRes.data.data.paymentUrl;
            return;
          }
        } catch (payErr) {
          console.error('Payment error:', payErr);
          setError('Lỗi khi tạo link thanh toán VNPay');
          setLoading(false);
          return;
        }
      }

      // COD - hoàn tất luôn
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
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: '16px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
          🛒 Giỏ Hàng
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          {cart.length} sản phẩm trong giỏ hàng
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#fee',
          color: '#e74c3c',
          borderRadius: '12px',
          borderLeft: '4px solid #e74c3c'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          backgroundColor: '#efe',
          color: '#27ae60',
          borderRadius: '12px',
          borderLeft: '4px solid #27ae60',
          animation: 'fadeIn 0.3s ease'
        }}>
          {success}
        </div>
      )}

      {cart.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Giỏ hàng trống</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>Hãy thêm sản phẩm vào giỏ hàng!</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ← Tiếp Tục Mua Sắm
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
          {/* Cart Items */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.5rem',
              background: '#f8f9fa',
              borderBottom: '2px solid #eee',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
              gap: '1rem',
              fontWeight: '600',
              color: '#7f8c8d'
            }}>
              <div>Sản Phẩm</div>
              <div style={{ textAlign: 'center' }}>Giá</div>
              <div style={{ textAlign: 'center' }}>Số Lượng</div>
              <div style={{ textAlign: 'right' }}>Thành Tiền</div>
              <div></div>
            </div>

            {/* Items */}
            <div>
              {cart.map((item) => (
                <div key={item.productId} style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                  gap: '1rem',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  {/* Product */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/products/${item.productId}`)}
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#2c3e50', cursor: 'pointer' }}
                        onClick={() => navigate(`/products/${item.productId}`)}
                      >
                        {item.name}
                      </h4>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#7f8c8d', fontSize: '0.85rem' }}>
                        📦 Còn {item.quantity} sản phẩm
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ textAlign: 'center', color: '#2c3e50', fontWeight: '500' }}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(item.price)}
                  </div>

                  {/* Quantity */}
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{
                          width: '36px',
                          height: '36px',
                          border: 'none',
                          background: '#f8f9fa',
                          cursor: 'pointer',
                          fontSize: '1.2rem'
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        style={{
                          width: '50px',
                          height: '36px',
                          border: 'none',
                          textAlign: 'center',
                          fontSize: '1rem',
                          fontWeight: '600'
                        }}
                      />
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{
                          width: '36px',
                          height: '36px',
                          border: 'none',
                          background: '#f8f9fa',
                          cursor: 'pointer',
                          fontSize: '1.2rem'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{ textAlign: 'right', fontWeight: '700', color: '#e74c3c', fontSize: '1.1rem' }}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(item.price * item.quantity)}
                  </div>

                  {/* Remove */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => removeItem(item.productId)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#fee',
                        color: '#e74c3c',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#e74c3c';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#fee';
                        e.target.style.color = '#e74c3c';
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            padding: '2rem',
            height: 'fit-content',
            position: 'sticky',
            top: '20px'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#2c3e50' }}>
              📝 Tóm Tắt Đơn Hàng
            </h3>

            {/* Coupon Input */}
            <CouponInput
              orderTotal={getTotalPrice()}
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
            />

            {/* Payment Method Selection */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #f0f0f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#2c3e50' }}>
                💳 Phương Thức Thanh Toán
              </h4>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {/* COD Option */}
                <label style={{
                  flex: 1,
                  padding: '1rem',
                  border: paymentMethod === 'COD' ? '2px solid #27ae60' : '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: paymentMethod === 'COD' ? '#f0f9f0' : 'white',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📦</div>
                  <div style={{ fontWeight: '600', color: '#2c3e50' }}>COD</div>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Thanh toán khi nhận hàng</div>
                </label>

                {/* VNPay Option */}
                <label style={{
                  flex: 1,
                  padding: '1rem',
                  border: paymentMethod === 'VNPAY' ? '2px solid #3498db' : '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: paymentMethod === 'VNPAY' ? '#f0f7fc' : 'white',
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === 'VNPAY'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🏦</div>
                  <div style={{ fontWeight: '600', color: '#2c3e50' }}>VNPay</div>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Thanh toán qua VNPay</div>
                </label>
              </div>
            </div>

            {/* Shipping Address Form - Only show for COD */}
            {paymentMethod === 'COD' && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #f0f0f0' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#2c3e50' }}>
                  📍 Địa Chỉ Giao Hàng
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Họ và tên"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                  />

                  <input
                    type="tel"
                    placeholder="Số điện thoại (VD: 0123456789)"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease'
                    }}
                  />

                  <textarea
                    placeholder="Địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, thành phố)"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Summary */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#7f8c8d' }}>
                <span>Tạm tính:</span>
                <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(getTotalPrice())}
                </span>
              </div>

              {getDiscountAmount() > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#27ae60' }}>
                  <span>🎉 Giảm giá:</span>
                  <span style={{ fontWeight: '600' }}>
                    -{new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(getDiscountAmount())}
                  </span>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Tổng cộng:</span>
                <span style={{ fontWeight: '700', fontSize: '1.4rem', color: '#e74c3c' }}>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(getFinalTotal())}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  marginBottom: '0.75rem'
                }}
              >
                {loading ? '⏳ Đang Xử Lý...' : paymentMethod === 'COD' ? '📦 Đặt Hàng (COD)' : '💳 Thanh Toán'}
              </button>

              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'white',
                  color: '#7f8c8d',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Tiếp Tục Mua Sắm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CartPage;
