/**
 * Unified SSE Service - Real-time updates for ALL features
 * Thay thế: orders SSE + notifications SSE + chat SSE
 * Chỉ dùng 1 connection duy nhất để tránh Render kill
 */

// API_BASE_URL đã bao gồm /api rồi (xem .env.local)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class SSEService {
  constructor() {
    this.eventSource = null;
    this.connected = false;
    this.userId = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 30000;
    this.listeners = {};
  }

  connect(userId) {
    // Không reconnect nếu đã có connection
    if (this.eventSource || !userId) return;

    this.userId = userId;
    const token = localStorage.getItem('token');
    if (!token || !userId) return;

    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      // Sử dụng endpoint orders/sse làm unified endpoint
      // Backend sẽ gửi tất cả events qua đường này
      this.eventSource = new EventSource(`${API_BASE_URL}/orders/sse?token=${token}`);

      this.eventSource.onopen = () => {
        this.connected = true;
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Order updates
          if (data.type === 'ORDER_STATUS_CHANGED') {
            this.emit('order_updated', data);
          }
          // New order notification
          else if (data.type === 'NEW_ORDER') {
            this.emit('new_order', data);
          }
          // Notification (mapped from backend)
          else if (data.type === 'new_notification') {
            this.emit('notification', data.notification);
          }
        } catch (e) {
          // Silent fail
        }
      };

      this.eventSource.onerror = () => {
        this.connected = false;
        this.eventSource = null;

        // Exponential backoff
        this.reconnectAttempts++;
        const delay = Math.min(3000 * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

        if (this.userId) {
          this.reconnectTimer = setTimeout(() => {
            this.connect(this.userId);
          }, delay);
        }
      };
    } catch (e) {}
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
    this.reconnectAttempts = 0;
    this.listeners = {};
  }

  // Listen for order updates
  onOrderUpdate(callback) {
    if (!this.listeners.order_updated) this.listeners.order_updated = [];
    this.listeners.order_updated.push(callback);
  }

  // Listen for new orders (admin)
  onNewOrder(callback) {
    if (!this.listeners.new_order) this.listeners.new_order = [];
    this.listeners.new_order.push(callback);
  }

  // Listen for notifications
  onNotification(callback) {
    if (!this.listeners.notification) this.listeners.notification = [];
    this.listeners.notification.push(callback);
  }

  // Internal emit
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch (e) {}
      });
    }
  }
}

const sseService = new SSEService();
export default sseService;
