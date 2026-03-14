import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [orderNotification, setOrderNotification] = useState({
    count: 0,
    read: true,
  });

  const [adminNotification, setAdminNotification] = useState({
    count: 0,
    read: true,
  });

  const markOrdersRead = () => {
    setOrderNotification(prev => ({
      ...prev,
      read: true,
    }));
  };

  const markAdminRead = () => {
    setAdminNotification(prev => ({
      ...prev,
      read: true,
    }));
  };

  const setOrderNotificationCount = (count) => {
    setOrderNotification({
      count,
      read: false,
    });
  };

  const setAdminNotificationCount = (count) => {
    setAdminNotification({
      count,
      read: false,
    });
  };

  const incrementOrderNotification = () => {
    setOrderNotification(prev => ({
      count: prev.count + 1,
      read: false,
    }));
  };

  const incrementAdminNotification = () => {
    setAdminNotification(prev => ({
      count: prev.count + 1,
      read: false,
    }));
  };

  const value = {
    orderNotification,
    adminNotification,
    markOrdersRead,
    markAdminRead,
    setOrderNotificationCount,
    setAdminNotificationCount,
    incrementOrderNotification,
    incrementAdminNotification,
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
