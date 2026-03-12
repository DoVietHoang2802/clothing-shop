import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container">
      <h1>⚙️ Bảng Điều Khiển Admin</h1>

      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        <Link to="/admin/users">
          <div className="card" style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>👥</h2>
            <h3>Quản Lý Người Dùng</h3>
          </div>
        </Link>

        <Link to="/admin/categories">
          <div className="card" style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>📂</h2>
            <h3>Quản Lý Danh Mục</h3>
          </div>
        </Link>

        <Link to="/admin/products">
          <div className="card" style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>👕</h2>
            <h3>Quản Lý Sản Phẩm</h3>
          </div>
        </Link>

        <Link to="/admin/coupons">
          <div className="card" style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎫</h2>
            <h3>Quản Lý Coupon</h3>
          </div>
        </Link>

        <Link to="/admin/orders">
          <div className="card" style={{ textAlign: 'center', padding: '2rem', cursor: 'pointer' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>📦</h2>
            <h3>Quản Lý Đơn Hàng</h3>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
