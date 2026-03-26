/**
 * Notification SSE Service - Real-time notifications
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class NotificationSSEService {
  constructor() {
    this.eventSource = null;
    this.connected = false;
    this.userId = null;
    this.listeners = [];
  }

  connect(userId) {
    if (this.eventSource) {
      this.disconnect();
    }

    this.userId = userId;
    const token = localStorage.getItem('token');

    if (!token || !userId) return;

    this.eventSource = new EventSource(`${API_BASE_URL}/api/notifications/sse?token=${token}`);

    this.eventSource.onopen = () => {
      this.connected = true;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'new_notification') {
          // Notify all listeners
          this.listeners.forEach(callback => callback(data.notification));
        }
      } catch (e) {
        console.error('Notification SSE parse error:', e);
      }
    };

    this.eventSource.onerror = () => {
      this.connected = false;
      // Auto reconnect
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
      this.listeners = [];
    }
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
