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
  }

  connect(userId) {
    // Không reconnect nếu đã có connection đang hoạt động
    if (this.eventSource || !userId) return;

    this.userId = userId;
    const token = localStorage.getItem('token');
    if (!token || !userId) return;

    try {
      this.eventSource = new EventSource(`${API_BASE_URL}/notifications/sse?token=${token}`);

      this.eventSource.onopen = () => {
        this.connected = true;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_notification') {
            this.listeners.forEach(callback => {
              try { callback(data.notification); } catch (e) {}
            });
          }
        } catch (e) {}
      };

      this.eventSource.onerror = () => {
        this.connected = false;
        this.disconnect();
        // Không auto reconnect - sẽ rely vào notification bell polling
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
