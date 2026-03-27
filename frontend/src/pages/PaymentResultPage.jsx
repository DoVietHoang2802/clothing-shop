import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);

  // Xử lý cả VNPay và MoMo callback
  const status = searchParams.get('status');
  const success = status === 'success' || searchParams.get('success') === 'true';
  const resultCode = searchParams.get('resultCode');
  const message = searchParams.get('message') || '';
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const transId = searchParams.get('transId');

  // MoMo success = resultCode === '0'
  const isMomoSuccess = resultCode === '0';
  const isSuccess = success || isMomoSuccess;

  useEffect(() => {
    // Nếu có orderId, lấy thông tin đơn hàng
    if (orderId && isSuccess) {
      loadOrderInfo();
    } else {
      setLoading(false);
    }
  }, [orderId, isSuccess]);

  const loadOrderInfo = async () => {
    try {
      // Thử lấy thông tin đơn hàng
      const res = await orderService.getOrderById(orderId);
      if (res.data.success) {
        setOrderData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Đang tải...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{
        maxWidth: '500px',
        margin: '4rem auto',
        padding: '2rem',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: success ? 'linear-gradient(135deg, #27ae60 0%, #229954 100%)' : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2.5rem'
        }}>
          {success ? '✓' : '✕'}
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 1rem 0',
          color: isSuccess ? '#27ae60' : '#e74c3c',
          fontSize: '1.8rem'
        }}>
          {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h2>

        {/* Message */}
        <p style={{
          color: '#7f8c8d',
          marginBottom: '1.5rem',
          fontSize: '1rem'
        }}>
          {message || (isSuccess ? 'Cảm ơn bạn đã mua sắm!' : 'Vui lòng thử lại hoặc liên hệ hỗ trợ.')}
        </p>

        {/* Order Info */}
        {orderData && (
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#7f8c8d' }}>Mã đơn hàng:</span>
              <span style={{ fontWeight: '600', color: '#2c3e50' }}>#{orderData._id.substring(0, 8).toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#7f8c8d' }}>Số tiền:</span>
              <span style={{ fontWeight: '700', color: '#e74c3c' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.finalPrice || orderData.totalPrice)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#7f8c8d' }}>Phương thức:</span>
              <span style={{ fontWeight: '600', color: '#3498db' }}>
                {orderData.paymentMethod === 'MOMO' ? 'MoMo' : 'VNPay'}
              </span>
            </div>
            {transId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#7f8c8d' }}>Mã giao dịch:</span>
                <span style={{ fontWeight: '600', color: '#9b59b6' }}>{transId}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f8c8d' }}>Trạng thái:</span>
              <span style={{
                fontWeight: '600',
                color: orderData.status === 'CONFIRMED' ? '#27ae60' : '#f39c12'
              }}>
                {orderData.status === 'CONFIRMED' ? 'Đã xác nhận' : orderData.status}
              </span>
            </div>
          </div>
        )}

        {/* Amount (from redirect) */}
        {amount && (
          <div style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#e74c3c',
            marginBottom: '1.5rem'
          }}>
            Số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <Link
            to="/my-orders"
            style={{
              padding: '1rem',
              background: isSuccess ? 'linear-gradient(135deg, #27ae60 0%, #229954 100%)' : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            📋 Xem đơn hàng của tôi
          </Link>

          <Link
            to="/"
            style={{
              padding: '1rem',
              background: 'white',
              color: '#7f8c8d',
              border: '2px solid #ddd',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            🏠 Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
