import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) { setError('Vui lòng nhập email'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Email không hợp lệ'); return; }

    if (!name.trim()) { setError('Vui lòng nhập họ tên'); return; }

    if (!newPassword) { setError('Vui lòng nhập mật khẩu mới'); return; }
    if (newPassword.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }

    if (newPassword !== confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return; }

    try {
      setLoading(true);
      await authService.forgotPassword(email, name, newPassword, confirmPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '2rem 1rem', background: '#f5f6fa'
    }}>
      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'white', borderRadius: '20px',
        padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>

        {!success ? (
          <>
            {/* Lock icon */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', fontSize: '1.75rem'
            }}>
              🔑
            </div>

            <h2 style={{ textAlign: 'center', marginBottom: '0.25rem', color: '#1a1a2e' }}>
              Quên Mật Khẩu
            </h2>
            <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Nhập thông tin bên dưới để đặt lại mật khẩu
            </p>

            {/* Error */}
            {error && (
              <div style={{
                padding: '0.875rem 1rem', marginBottom: '1.25rem',
                background: '#fee', color: '#e74c3c', borderRadius: '10px',
                borderLeft: '4px solid #e74c3c', fontSize: '0.875rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email đã đăng ký"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '0.75rem',
                    border: error && !email ? '2px solid #e74c3c' : '2px solid #e0e0e0',
                    borderRadius: '10px', fontSize: '1rem', outline: 'none',
                    boxSizing: 'border-box', transition: 'border 0.2s',
                  }}
                />
              </div>

              {/* Họ tên */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ tên đã đăng ký"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px', fontSize: '1rem', outline: 'none',
                    boxSizing: 'border-box', transition: 'border 0.2s',
                  }}
                />
              </div>

              {/* Mật khẩu mới */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                  Mật khẩu mới
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px', fontSize: '1rem', outline: 'none',
                      boxSizing: 'border-box', transition: 'border 0.2s',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow('new')}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                    }}
                  >
                    {showPasswords.new ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                  Xác nhận mật khẩu
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                      border: '2px solid #e0e0e0',
                      borderRadius: '10px', fontSize: '1rem', outline: 'none',
                      boxSizing: 'border-box', transition: 'border 0.2s',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow('confirm')}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
                    }}
                  >
                    {showPasswords.confirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '0.875rem',
                  background: loading
                    ? '#a0a0c0'
                    : 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white', border: 'none', borderRadius: '10px',
                  fontWeight: '700', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#888', fontSize: '0.875rem' }}>
              Nhớ mật khẩu rồi?{' '}
              <Link to="/login" style={{ color: '#667eea', fontWeight: '600' }}>Đăng Nhập</Link>
            </p>
          </>
        ) : (
          /* ===== SUCCESS STATE ===== */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', fontSize: '2rem'
            }}>
              ✓
            </div>
            <h3 style={{ color: '#1a1a2e', marginBottom: '0.75rem' }}>
              Đặt lại mật khẩu thành công!
            </h3>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập với mật khẩu mới.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%', padding: '0.875rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
              }}
            >
              Đăng Nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;