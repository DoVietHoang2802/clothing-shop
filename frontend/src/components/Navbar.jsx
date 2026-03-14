import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { orderNotification, adminNotification, markOrdersRead, markAdminRead } = useNotifications();
  const [cartCount, setCartCount] = useState(0);

  // Đồng bộ số lượng sản phẩm trong giỏ từ localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(totalItems);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();

    // Lắng nghe thay đổi từ các tab khác
    const handleStorage = (e) => {
      if (e.key === 'cart') {
        updateCartCount();
      }
    };
    window.addEventListener('storage', handleStorage);

    // Lắng nghe custom event trong cùng tab
    const handleCartUpdated = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdated);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">💻 TECH STORE</Link>
      </div>

      <ul className="navbar-nav">
        <li><Link to="/">🏠 Trang Chủ</Link></li>
        <li><Link to="/products">🛍️ Sản Phẩm</Link></li>

        {!isAuthenticated ? (
          <>
            <li><Link to="/login">🔑 Đăng Nhập</Link></li>
            <li><Link to="/register">📝 Đăng Ký</Link></li>
          </>
        ) : (
          <>
            <li>
              <Link to="/my-orders" onClick={markOrdersRead}>
                <span style={{ position: 'relative' }}>
                  📦 Đơn Hàng
                  {orderNotification.count > 0 && !orderNotification.read && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '2px solid white',
                      }}
                    >
                      {orderNotification.count}
                    </span>
                  )}
                </span>
              </Link>
            </li>
            <li><Link to="/wishlist">❤️ Yêu Thích</Link></li>
            <li><Link to="/cart">🛒 Giỏ ({cartCount})</Link></li>
            <li><Link to="/profile">👤 Hồ Sơ</Link></li>

            {user?.role === 'STAFF' && (
              <li><Link to="/staff/products">📦 Quản Lý</Link></li>
            )}

            {user?.role === 'ADMIN' && (
              <li>
                <Link to="/admin/dashboard" onClick={markAdminRead}>
                  <span style={{ position: 'relative' }}>
                    ⚙️ Admin
                    {adminNotification.count > 0 && !adminNotification.read && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          border: '2px solid white',
                        }}
                      >
                        {adminNotification.count}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            )}

            <li>
              <button className="navbar-btn" onClick={logout}>
                🚪 Đăng Xuất
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
