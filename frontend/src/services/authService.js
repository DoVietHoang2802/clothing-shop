import api from './api';

const authService = {
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  refreshToken: (token) => {
    return api.post('/auth/refresh-token', { token });
  },

  changePassword: (currentPassword, newPassword, confirmPassword) => {
    return api.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  decodeToken: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  },

  googleLogin: (googleToken) => {
    return api.post('/auth/google', { googleToken });
  },

  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: (token, newPassword, confirmPassword) => {
    return api.post(`/auth/reset-password/${token}`, { newPassword, confirmPassword });
  },
};

export default authService;
