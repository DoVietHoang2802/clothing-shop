import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { toast } from './ToastNotification';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount, markAsRead, markAllAsRead, toastNotification } = useNotifications();
  const [cartCount, setCartCount] = useState(0);

  // Hiển thị toast khi có notification mới qua SSE
  useEffect(() => {
    if (toastNotification) {
      toast.info(toastNotification.message || 'Bạn có thông báo mới!');
    }
  }, [toastNotification]);

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
              <Link to="/notifications" style={{ position: 'relative', display: 'inline-block' }}>
                🔔 Thông Báo
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-12px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      borderRadius: '50%',
                      minWidth: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      border: '2px solid white',
                      padding: '0 4px',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link to="/my-orders">
                📦 Đơn Hàng
              </Link>
            </li>
            <li><Link to="/wishlist">❤️ Yêu Thích</Link></li>
            <li><Link to="/cart">🛒 Giỏ ({cartCount})</Link></li>
            <li><Link to="/profile">👤 Hồ Sơ</Link></li>

            {(user?.role === 'STAFF' || user?.role === 'ADMIN') && (
              <li><Link to="/staff/dashboard">📦 Quản Lý</Link></li>
            )}

            {user?.role === 'ADMIN' && (
              <li><Link to="/admin/dashboard">⚙️ Admin</Link></li>
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
