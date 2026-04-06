import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
  } = useNotifications();

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ORDER_STATUS':
      case 'ORDER_CANCELLED':
        return '📦';
      case 'PROMOTION':
        return '🎁';
      case 'REVIEW_REQUEST':
        return '⭐';
      case 'CHAT':
        return '💬';
      case 'SYSTEM':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ORDER_STATUS':
      case 'ORDER_CANCELLED':
        return '#667eea';
      case 'PROMOTION':
        return '#f39c12';
      case 'REVIEW_REQUEST':
        return '#27ae60';
      case 'CHAT':
        return '#3498db';
      case 'SYSTEM':
        return '#95a5a6';
      default:
        return '#667eea';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#2c3e50' }}>🔔 Thông Báo</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#7f8c8d' }}>
            {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo'}
          </p>
        </div>

        {notifications.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                }}
              >
                ✓ Đánh dấu đã đọc
              </button>
            )}
            {notifications.some(n => n.isRead) && (
              <button
                onClick={deleteReadNotifications}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#fee',
                  color: '#e74c3c',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                }}
              >
                🗑️ Xóa đã đọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔔</div>
          <h3 style={{ color: '#666', marginBottom: '0.5rem' }}>Không có thông báo nào</h3>
          <p style={{ color: '#999' }}>Các thông báo sẽ xuất hiện ở đây</p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          {notifications.map((notification, index) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              style={{
                padding: '1rem 1.5rem',
                borderBottom: index < notifications.length - 1 ? '1px solid #f0f0f0' : 'none',
                background: notification.isRead ? 'white' : '#f8f9ff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = notification.isRead ? '#f8f9fa' : '#f0f4ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = notification.isRead ? 'white' : '#f8f9ff';
              }}
            >
              {/* Icon */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: `${getTypeColor(notification.type)}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                flexShrink: 0,
              }}>
                {getTypeIcon(notification.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.25rem'
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: notification.isRead ? '500' : '700',
                    color: '#2c3e50'
                  }}>
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#667eea',
                      flexShrink: 0,
                      marginLeft: '0.5rem',
                      marginTop: '0.25rem'
                    }} />
                  )}
                </div>

                <p style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  color: '#7f8c8d',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {notification.message}
                </p>

                <span style={{
                  fontSize: '0.8rem',
                  color: '#bdc3c7',
                  marginTop: '0.5rem',
                  display: 'block'
                }}>
                  {formatTime(notification.createdAt)}
                </span>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification._id);
                }}
                style={{
                  padding: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#bdc3c7',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fee';
                  e.target.style.color = '#e74c3c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#bdc3c7';
                }}
                title="Xóa thông báo"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
