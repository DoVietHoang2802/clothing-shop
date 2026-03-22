import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import socketService from '../config/socket';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Kiểm tra token khi app load
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      const decoded = authService.decodeToken(savedToken);
      if (decoded) {
        setUser({
          id: decoded.id,
          role: decoded.role,
        });
        // Kết nối socket khi có user đã đăng nhập trước đó
        socketService.connect(decoded.id);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { token, user } = response.data.data;

      authService.setToken(token);
      authService.setUser(user);

      setToken(token);
      setUser({
        id: user.id,
        role: user.role,
      });

      // Kết nối socket sau khi đăng nhập
      socketService.connect(user.id);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const googleLogin = async (googleToken) => {
    try {
      const response = await authService.googleLogin(googleToken);
      const { token, user } = response.data.data;

      authService.setToken(token);
      authService.setUser(user);

      setToken(token);
      setUser({
        id: user.id,
        role: user.role,
      });

      // Kết nối socket sau khi đăng nhập
      socketService.connect(user.id);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authService.register({ name, email, password });
      const { token, user } = response.data.data;

      authService.setToken(token);
      authService.setUser(user);

      setToken(token);
      setUser({
        id: user.id,
        role: user.role,
      });

      // Kết nối socket sau khi đăng ký
      socketService.connect(user.id);

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    // Ngắt kết nối socket khi đăng xuất
    socketService.disconnect();
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    googleLogin,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
