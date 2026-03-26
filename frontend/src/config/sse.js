/**
 * SSE Service - Real-time order status updates
 * Sử dụng SSE thay vì Socket.io để tương thích với Vercel production
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class SSEService {
  constructor() {
    this.eventSource = null;
    this.listeners = {};
    this.connected = false;
    this.userId = null;
  }

  connect(userId) {
    if (this.eventSource) {
      this.disconnect();
    }

    this.userId = userId;
    const token = localStorage.getItem('token');

    if (!token || !userId) return;

    this.eventSource = new EventSource(`${API_BASE_URL}/api/orders/sse?token=${token}`);

    this.eventSource.onopen = () => {
      this.connected = true;
      console.log('✅ SSE connected for order updates');
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle different event types
        if (data.type === 'ORDER_STATUS_CHANGED') {
          this.emit('order_updated', data);
        } else if (data.type === 'connected') {
          console.log('SSE connected:', data.userId);
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    this.eventSource.onerror = (error) => {
      console.log('SSE connection error - will retry...');
      this.connected = false;

      // Cleanup on error
      setTimeout(() => {
        if (this.userId && !this.connected) {
          this.connect(this.userId);
        }
      }, 5000);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.connected = false;
      this.userId = null;
    }
  }

  // Listen for order updates
  onOrderUpdate(callback) {
    if (!this.listeners.order_updated) {
      this.listeners.order_updated = [];
    }
    this.listeners.order_updated.push(callback);
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
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

const sseService = new SSEService();
export default sseService;
