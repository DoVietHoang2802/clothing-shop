import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import notificationService from '../services/notificationService';
import sseService from '../config/sse';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const pollingRef = useRef(null);

  // Load notifications from API
  const loadNotifications = useCallback(async () => {
    if (!localStorage.getItem('token')) return;

    try {
      setLoading(true);
      const res = await notificationService.getNotifications({ limit: 20 });
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load unread count only
  const loadUnreadCount = useCallback(async () => {
    if (!localStorage.getItem('token')) return;

    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data.data?.count || 0);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  }, []);

  // Get userId from localStorage
  const getUserId = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData).id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // Polling fallback - tăng lên 2 phút để tránh Render free tier sleep
  // SSE đã handle real-time, polling chỉ là backup khi SSE fail
  const startPolling = useCallback(() => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(() => {
      loadUnreadCount();
    }, 120000); // 2 phút thay vì 30s
  }, [loadUnreadCount]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Load notifications on mount + SSE real-time + polling
  useEffect(() => {
    const userId = getUserId();
    if (userId && localStorage.getItem('token')) {
      loadNotifications();
      loadUnreadCount();
      startPolling();

      // Kết nối SSE để nhận thông báo real-time
      sseService.connect(userId);

      // Lắng nghe thông báo mới từ SSE
      const handleNewNotification = (notification) => {
        setNotifications(prev => {
          // Tránh trùng lặp nếu notification đã tồn tại
          if (prev.some(n => n._id === notification._id)) return prev;
          return [notification, ...prev];
        });
        setUnreadCount(prev => prev + 1);
        setToastNotification(notification);
        setTimeout(() => setToastNotification(null), 5000);
      };

      sseService.onNotification(handleNewNotification);
    }

    return () => stopPolling();
  }, [loadNotifications, loadUnreadCount, startPolling, stopPolling]);

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const notification = notifications.find(n => n._id === notificationId);
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Delete all read notifications
  const deleteReadNotifications = async () => {
    try {
      await notificationService.deleteReadNotifications();
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (err) {
      console.error('Error deleting read notifications:', err);
    }
  };

  // Add notification (for real-time)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    toastNotification,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteReadNotifications,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
