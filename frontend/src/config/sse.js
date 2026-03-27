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
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 30000; // Max 30s giữa các lần reconnect
  }

  connect(userId) {
    // Prevent multiple connections
    if (this.eventSource) {
      this.disconnect();
    }

    this.userId = userId;
    const token = localStorage.getItem('token');

    if (!token || !userId) {
      return;
    }

    try {
      // Close any existing connection first
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource(`${API_BASE_URL}/orders/sse?token=${token}`);

      this.eventSource.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'ORDER_STATUS_CHANGED') {
            this.emit('order_updated', data);
          } else if (data.type === 'NEW_ORDER') {
            this.emit('new_order', data);
          }
        } catch (e) {
          // Silent fail for parse errors
        }
      };

      this.eventSource.onerror = () => {
        this.connected = false;

        // Clear existing reconnect timer
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }

        // Exponential backoff: 3s, 6s, 12s, 24s, max 30s
        this.reconnectAttempts++;
        const delay = Math.min(3000 * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

        if (this.userId) {
          this.reconnectTimer = setTimeout(() => {
            if (!this.connected && this.userId) {
              this.connect(this.userId);
            }
          }, delay);
        }
      };
    } catch (e) {
      // Silent fail
    }
  }

  disconnect() {
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
    this.reconnectAttempts = 0;
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

  // Listen for new orders (admin)
  onNewOrder(callback) {
    if (typeof callback === 'function') {
      if (!this.listeners.new_order) {
        this.listeners.new_order = [];
      }
      this.listeners.new_order.push(callback);
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
            // Silent fail for callback errors
          }
        }
      });
    }
  }
}

const sseService = new SSEService();
export default sseService;
