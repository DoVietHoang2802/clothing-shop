import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await adminService.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Quản Lý Người Dùng',
      icon: '👥',
      description: 'Quản lý tài khoản và quyền người dùng',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link: '/admin/users',
      count: stats?.totalUsers || 0
    },
    {
      title: 'Quản Lý Danh Mục',
      icon: '📂',
      description: 'Quản lý danh mục sản phẩm',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      link: '/admin/categories',
      count: stats?.totalCategories || 0
    },
    {
      title: 'Quản Lý Sản Phẩm',
      icon: '👕',
      description: 'Quản lý thông tin sản phẩm',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      link: '/admin/products',
      count: stats?.totalProducts || 0
    },
    {
      title: 'Quản Lý Coupon',
      icon: '🎫',
      description: 'Quản lý mã giảm giá',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      link: '/admin/coupons',
      count: '...'
    },
    {
      title: 'Quản Lý Đơn Hàng',
      icon: '📦',
      description: 'Quản lý đơn hàng và vận chuyển',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      link: '/admin/orders',
      count: stats?.totalOrders || 0
    }
  ];

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
          <p style={{ color: '#666' }}>Đang tải dữ liệu...</p>
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
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
          ⚙️ Bảng Điều Khiển Admin
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
          Chào mừng bạn đến với trang quản trị
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Tổng Người Dùng</p>
              <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: '700', color: '#667eea' }}>
                {stats?.totalUsers || 0}
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#27ae60' }}>
                +{stats?.newUsersThisMonth || 0} tháng này
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem'
            }}>
              👥
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Tổng Sản Phẩm</p>
              <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: '700', color: '#4facfe' }}>
                {stats?.totalProducts || 0}
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#e74c3c' }}>
                {stats?.lowStockProducts || 0} sắp hết hàng
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4facfe20 0%, #00f2fe20 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem'
            }}>
              👕
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Tổng Đơn Hàng</p>
              <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: '700', color: '#43e97b' }}>
                {stats?.totalOrders || 0}
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#f39c12' }}>
                {stats?.pendingOrders || 0} chờ xử lý
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #43e97b20 0%, #38f9d720 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem'
            }}>
              📦
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>Doanh Thu</p>
              <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: '700', color: '#fa709a' }}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  maximumFractionDigits: 0
                }).format(stats?.totalRevenue || 0)}
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#27ae60' }}>
                {stats?.completedOrderCount || 0} đơn hoàn thành
              </p>
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fa709a20 0%, #fee14020 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem'
            }}>
              💰
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Summary */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>📊 Tổng quan đơn hàng</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Chờ xác nhận', count: stats?.pendingOrders || 0, color: '#f39c12', bg: '#f39c1220' },
            { label: 'Đã xác nhận', count: stats?.shippedOrders || 0, color: '#3498db', bg: '#3498db20' },
            { label: 'Hoàn thành', count: stats?.completedOrderCount || 0, color: '#27ae60', bg: '#27ae6020' },
            { label: 'Đã hủy', count: stats?.cancelledOrders || 0, color: '#e74c3c', bg: '#e74c3c20' },
          ].map((item, index) => (
            <div key={index} style={{
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              background: item.bg,
              flex: '1',
              minWidth: '150px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: item.color, fontWeight: '700', fontSize: '1.5rem' }}>
                {item.count}
              </p>
              <p style={{ margin: '0.25rem 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem'
      }}>
        {menuItems.map((item, index) => (
          <Link key={index} to={item.link} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
            >
              {/* Background decoration */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: item.color,
                opacity: 0.1
              }} />

              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                {item.icon}
              </div>

              <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#2c3e50'
              }}>
                {item.title}
              </h3>

              <p style={{
                margin: 0,
                color: '#7f8c8d',
                fontSize: '0.9rem'
              }}>
                {item.description}
              </p>

              {/* Count badge */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                background: item.color,
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                {item.count}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
