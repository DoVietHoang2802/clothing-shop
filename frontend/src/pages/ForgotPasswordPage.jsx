import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [devToken, setDevToken] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDevToken('');

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword(email);
      setSuccess(true);

      // DEV MODE: Nếu có resetToken trả về (chỉ dev)
      if (res.data.data?.resetToken) {
        setDevToken(res.data.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
        }}
      >
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: '450px',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#27ae60',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2rem'
          }}>
            ✓
          </div>
          <h2 style={{ color: '#27ae60', marginBottom: '1rem' }}>Đã gửi liên kết!</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Nếu email <strong>{email}</strong> tồn tại trong hệ thống,
            bạn sẽ nhận được liên kết đặt lại mật khẩu trong giây lát.
          </p>

          {devToken && (
            <div style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              textAlign: 'left'
            }}>
              <p style={{ fontWeight: '600', color: '#856404', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                ⚠️ DEV MODE - Token reset (xóa khi deploy):
              </p>
              <code style={{
                display: 'block',
                wordBreak: 'break-all',
                fontSize: '0.75rem',
                color: '#856404'
              }}>
                {devToken}
              </code>
              <button
                onClick={() => navigate(`/reset-password/${devToken}`)}
                style={{
                  marginTop: '0.5rem',
                  padding: '6px 12px',
                  background: '#ffc107',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
              >
                Đi đến trang đặt lại mật khẩu →
              </button>
            </div>
          )}

          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Không nhận được email? Kiểm tra thư mục Spam hoặc thử lại.
          </p>

          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: '#667eea',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2rem'
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          Quên Mật Khẩu?
        </h1>
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Nhập email đã đăng ký"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Gửi liên kết đặt lại'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          Nhớ mật khẩu rồi? <Link to="/login">Đăng Nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
