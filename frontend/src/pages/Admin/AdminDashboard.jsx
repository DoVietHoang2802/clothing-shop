import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const menuItems = [
    {
      title: 'Quản Lý Người Dùng',
      icon: '👥',
      description: 'Quản lý tài khoản và quyền người dùng',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link: '/admin/users'
    },
    {
      title: 'Quản Lý Danh Mục',
      icon: '📂',
      description: 'Quản lý danh mục sản phẩm',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      link: '/admin/categories'
    },
    {
      title: 'Quản Lý Sản Phẩm',
      icon: '👕',
      description: 'Quản lý thông tin sản phẩm',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      link: '/admin/products'
    },
    {
      title: 'Quản Lý Coupon',
      icon: '🎫',
      description: 'Quản lý mã giảm giá',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      link: '/admin/coupons'
    },
    {
      title: 'Quản Lý Đơn Hàng',
      icon: '📦',
      description: 'Quản lý đơn hàng và vận chuyển',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      link: '/admin/orders'
    }
  ];

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
        {[
          { label: 'Tổng Người Dùng', value: '1,234', icon: '👥', color: '#667eea' },
          { label: 'Tổng Sản Phẩm', value: '567', icon: '👕', color: '#4facfe' },
          { label: 'Tổng Đơn Hàng', value: '890', icon: '📦', color: '#43e97b' },
          { label: 'Doanh Thu', value: '12.5M', icon: '💰', color: '#fa709a' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: '12px',
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
                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>{stat.label}</p>
                <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: '700', color: stat.color }}>
                  {stat.value}
                </h2>
              </div>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: `${stat.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
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

              {/* Arrow indicator */}
              <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                right: '1.5rem',
                color: '#cbd5e0',
                fontSize: '1.2rem',
                transition: 'all 0.3s ease'
              }}>
                →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
