import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import userService from '../services/userService';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setFormData({
        name: response.data.data.name,
        email: response.data.data.email,
      });
      setError('');
    } catch (err) {
      console.error('Load profile error:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Vui lòng điền tất cả các trường');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await userService.updateProfile(formData);
      setSuccess('✅ Cập nhật profile thành công!');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật profile thất bại');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleInfo = (role) => {
    const roles = {
      ADMIN: { label: 'Quản Trị Viên', color: '#667eea', icon: '👑' },
      STAFF: { label: 'Nhân Viên', color: '#4facfe', icon: '💼' },
      USER: { label: 'Khách Hàng', color: '#43e97b', icon: '👤' }
    };
    return roles[role] || roles.USER;
  };

  if (loading) {
    return (
      <div className="container flex-center" style={{ minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#666' }}>Đang tải thông tin...</p>
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

  const roleInfo = getRoleInfo(authUser?.role);

  return (
    <div className="container">
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
          👤 Thông Tin Cá Nhân
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Profile Sidebar */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          padding: '2rem',
          textAlign: 'center',
          height: 'fit-content'
        }}>
          {/* Avatar */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '3rem',
            color: 'white',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
          }}>
            {formData.name ? formData.name.charAt(0).toUpperCase() : '👤'}
          </div>

          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', color: '#2c3e50' }}>
            {formData.name}
          </h2>

          <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d' }}>{formData.email}</p>

          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '20px',
            background: `${roleInfo.color}20`,
            color: roleInfo.color,
            fontWeight: '600',
            display: 'inline-block'
          }}>
            {roleInfo.icon} {roleInfo.label}
          </div>

          <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
            <button
              onClick={() => navigate('/addresses')}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '0.75rem',
                transition: 'all 0.3s ease'
              }}
            >
              📍 Địa Chỉ Giao Hàng
            </button>

            <button
              onClick={() => navigate('/change-password')}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '0.75rem',
                transition: 'all 0.3s ease'
              }}
            >
              🔐 Đổi Mật Khẩu
            </button>

            <button
              onClick={() => {
                if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
                  logout();
                  navigate('/login');
                }
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'white',
                color: '#e74c3c',
                border: '2px solid #e74c3c',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🚪 Đăng Xuất
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          padding: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#2c3e50' }}>
            📝 Cập Nhật Thông Tin
          </h3>

          {error && (
            <div style={{
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              backgroundColor: '#fee',
              color: '#e74c3c',
              borderRadius: '12px',
              borderLeft: '4px solid #e74c3c',
              animation: 'shake 0.5s ease-in-out'
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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#34495e' }}>
                👤 Tên Đầy Đủ
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                placeholder="Nhập tên của bạn"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#34495e' }}>
                📧 Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  background: '#f8f9fa'
                }}
                disabled
                placeholder="Nhập email của bạn"
              />
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#7f8c8d' }}>
                ⚠️ Email không thể thay đổi
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: submitting ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {submitting ? '⏳ Đang cập nhật...' : '✅ Lưu Thay Đổi'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  padding: '1rem 2rem',
                  background: 'white',
                  color: '#7f8c8d',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Quay Lại
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default UserProfilePage;
