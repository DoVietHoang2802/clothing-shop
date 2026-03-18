import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

const MockPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Nếu chưa đăng nhập, hiển thị thông báo
  if (!isAuthenticated) {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh' }}>
        <div style={{
          maxWidth: '400px',
          margin: '4rem auto',
          padding: '2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Vui lòng đăng nhập</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
            Bạn cần đăng nhập để tiếp tục thanh toán
          </p>
          <Link
            to="/login"
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block'
            }}
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!orderId) {
      setError('Không có mã đơn hàng');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Gọi API xác nhận thanh toán mock
      const res = await paymentService.confirmMockPayment(orderId);

      if (res.data.success) {
        // Xóa giỏ hàng sau khi thanh toán thành công
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        setSuccess(true);
      } else {
        setError(res.data.message || 'Thanh toán thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xác nhận thanh toán');
    } finally {
      setProcessing(false);
    }
  };

  // Hủy thanh toán - hủy đơn hàng và restore stock
  const handleCancel = async () => {
    if (!orderId) {
      setError('Không có mã đơn hàng');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn hủy thanh toán? Đơn hàng sẽ bị hủy.')) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const res = await paymentService.cancelMockPayment(orderId);

      if (res.data.success) {
        // Chuyển về trang đơn hàng
        navigate('/my-orders', { state: { message: 'Đơn hàng đã được hủy' } });
      } else {
        setError(res.data.message || 'Hủy thanh toán thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi hủy thanh toán');
    } finally {
      setProcessing(false);
    }
  };

  // Nếu đã thanh toán thành công
  if (success) {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh' }}>
        <div style={{
          maxWidth: '400px',
          margin: '4rem auto',
          padding: '2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2.5rem',
            color: 'white'
          }}>
            ✓
          </div>
          <h2 style={{ color: '#27ae60', marginBottom: '1rem' }}>Thanh toán thành công!</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
            Cảm ơn bạn đã mua sắm tại Clothing Shop!
          </p>

          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#7f8c8d' }}>Mã đơn hàng:</span>
              <span style={{ fontWeight: '600' }}>#{orderId?.substring(0, 8).toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#7f8c8d' }}>Số tiền:</span>
              <span style={{ fontWeight: '700', color: '#e74c3c' }}>
                {amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '0 VNĐ'}
              </span>
            </div>
          </div>

          <Link
            to="/my-orders"
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block',
              marginBottom: '1rem'
            }}
          >
            📋 Xem đơn hàng
          </Link>

          <div>
            <Link
              to="/"
              style={{
                color: '#7f8c8d',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex-center" style={{ minHeight: '60vh' }}>
      <div style={{
        maxWidth: '450px',
        margin: '4rem auto',
        padding: '2rem',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2rem'
          }}>
            🏦
          </div>
          <h2 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Thanh toán VNPay</h2>
          <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Giả lập thanh toán (Sandbox)</p>
        </div>

        {/* Order Info */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: '#7f8c8d' }}>Mã đơn hàng</span>
            <span style={{ fontWeight: '600', color: '#2c3e50' }}>
              #{orderId?.substring(0, 8).toUpperCase() || 'N/A'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#7f8c8d' }}>Số tiền thanh toán</span>
            <span style={{ fontWeight: '700', color: '#e74c3c', fontSize: '1.2rem' }}>
              {amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '0 VNĐ'}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee',
            color: '#e74c3c',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Payment Methods */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#7f8c8d', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            Chọn phương thức thanh toán:
          </p>

          <div style={{
            border: '2px solid #3498db',
            borderRadius: '12px',
            padding: '1rem',
            background: '#f0f7fc',
            cursor: 'pointer',
            marginBottom: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input type="radio" checked readOnly />
              <div>
                <div style={{ fontWeight: '600', color: '#2c3e50' }}>🏦 Thẻ ATM / Internet Banking</div>
                <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Thanh toán qua ngân hàng</div>
              </div>
            </div>
          </div>

          <div style={{
            border: '2px solid #ddd',
            borderRadius: '12px',
            padding: '1rem',
            opacity: 0.6
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input type="radio" disabled />
              <div>
                <div style={{ fontWeight: '600', color: '#2c3e50' }}>💳 Thẻ quốc tế (Visa/Master)</div>
                <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Thẻ Visa, Mastercard</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank List */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#7f8c8d', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            Chọn ngân hàng:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem'
          }}>
            {['Vietcombank', 'ViettinBank', 'BIDV', 'Agribank', 'MB Bank', 'TP Bank'].map(bank => (
              <div key={bank} style={{
                padding: '0.5rem',
                border: '2px solid #3498db',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: '#f0f7fc',
                cursor: 'pointer'
              }}>
                {bank}
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handlePayment}
          disabled={processing || !orderId}
          style={{
            width: '100%',
            padding: '1rem',
            background: processing ? '#95a5a6' : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: processing ? 'not-allowed' : 'pointer',
            marginBottom: '1rem'
          }}
        >
          {processing ? '⏳ Đang xử lý...' : '💰 Xác nhận thanh toán'}
        </button>

        {/* Cancel */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleCancel}
            disabled={processing}
            style={{
              background: 'none',
              border: 'none',
              color: '#e74c3c',
              textDecoration: 'none',
              fontSize: '0.9rem',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            ← Hủy thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockPaymentPage;
