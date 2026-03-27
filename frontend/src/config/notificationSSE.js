/**
 * Notification SSE Service - Real-time notifications
 */

// API_BASE_URL đã bao gồm /api rồi (xem .env.local)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class NotificationSSEService {
  constructor() {
    this.eventSource = null;
    this.connected = false;
    this.userId = null;
    this.listeners = [];
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 30000;
  }

  connect(userId) {
    if (this.eventSource) {
      this.disconnect();
    }

    this.userId = userId;
    const token = localStorage.getItem('token');

    if (!token || !userId) return;

    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(`${API_BASE_URL}/notifications/sse?token=${token}`);

    this.eventSource.onopen = () => {
      this.connected = true;
      this.reconnectAttempts = 0;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'new_notification') {
          this.listeners.forEach(callback => {
            try { callback(data.notification); } catch (e) {}
          });
        }
      } catch (e) {
        // Silent fail
      }
    };

    this.eventSource.onerror = () => {
      this.connected = false;

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Exponential backoff
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
    this.listeners = [];
    this.reconnectAttempts = 0;
  }

  // Listen for new notifications
  onNotification(callback) {
    this.listeners.push(callback);
  }

  // Remove listener
  offNotification() {
    this.listeners = [];
  }
}

const notificationSSE = new NotificationSSEService();
export default notificationSSE;
