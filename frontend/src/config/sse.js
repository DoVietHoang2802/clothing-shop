/**
 * SSE Service - Real-time order status updates
 * Sử dụng SSE thay vì Socket.io để tương thích với Vercel production
 */

// API_BASE_URL đã bao gồm /api rồi (xem .env.local)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class SSEService {
  constructor() {
    this.eventSource = null;
    this.listeners = {};
    this.connected = false;
    this.userId = null;
    this.reconnectTimer = null;
  }

  connect(userId) {
    // Prevent multiple connections
    if (this.eventSource) {
      this.disconnect();
    }

    this.userId = userId;
    const token = localStorage.getItem('token');

    if (!token || !userId) {
      console.log('SSE: Missing token or userId, skipping connection');
      return;
    }

    try {
      // API_BASE_URL đã bao gồm /api, không thêm lại
      this.eventSource = new EventSource(`${API_BASE_URL}/orders/sse?token=${token}`);

      this.eventSource.onopen = () => {
        this.connected = true;
        console.log('✅ SSE connected for order updates');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'ORDER_STATUS_CHANGED') {
            this.emit('order_updated', data);
          } else if (data.type === 'connected') {
            console.log('SSE connected:', data.userId);
          }
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };

      this.eventSource.onerror = () => {
        console.log('SSE connection error');
        this.connected = false;

        // Clear existing reconnect timer
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
        }

        // Reconnect after 5 seconds only if we have userId
        if (this.userId) {
          this.reconnectTimer = setTimeout(() => {
            if (!this.connected && this.userId) {
              console.log('SSE: Attempting to reconnect...');
              this.connect(this.userId);
            }
          }, 5000);
        }
      };
    } catch (e) {
      console.error('SSE connection error:', e);
    }
  }

  disconnect() {
    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.connected = false;
    this.userId = null;
    this.listeners = {};
  }

  // Listen for order updates
  onOrderUpdate(callback) {
    if (typeof callback === 'function') {
      if (!this.listeners.order_updated) {
        this.listeners.order_updated = [];
      }
      this.listeners.order_updated.push(callback);
    }
  }

  // Remove order update listener
  offOrderUpdate() {
    if (this.listeners.order_updated) {
      this.listeners.order_updated = [];
    }
  }

  // Internal emit method
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        if (typeof callback === 'function') {
          try {
            callback(data);
          } catch (e) {
            console.error('SSE callback error:', e);
          }
        }
      });
    }
  }
}

const sseService = new SSEService();
export default sseService;
