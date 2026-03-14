import axios from 'axios';
import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log("API_BASE_URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Flag để ngăn refresh token loop
let isRefreshing = false;
let failedQueue = [];

// Handle queue của requests khi token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

// Thêm token vào header tự động
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Không có token');
        }

        const response = await api.post('/auth/refresh-token', { token });
        const newToken = response.data.data.token;

        // Cập nhật token
        localStorage.setItem('token', newToken);
        authService.setToken(newToken);

        // Update header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        return api(originalRequest);
      } catch (err) {
        console.error('Token refresh failed:', err);
        
        // Logout
        authService.logout();
        processQueue(err, null);

        // Redirect login
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    console.error('API error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
    });
    
    return Promise.reject(error);
  }
);
