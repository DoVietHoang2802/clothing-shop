import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.connected = true;

      // Join user's personal room
      if (userId) {
        this.socket.emit('join', userId);
      }
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
    });

    this.socket.on('connect_error', () => {
      // Connection errors are handled silently - real-time features degrade gracefully
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Listen for order updates
  onOrderUpdate(callback) {
    if (!this.socket) return;
    this.socket.on('order_updated', (data) => {
      callback(data);
    });
  }

  // Remove order update listener
  offOrderUpdate() {
    if (!this.socket) return;
    this.socket.off('order_updated');
  }

  // Listen for chat messages
  onNewMessage(callback) {
    if (!this.socket) return;
    this.socket.on('new_message', (data) => {
      callback(data);
    });
  }

  offNewMessage() {
    if (!this.socket) return;
    this.socket.off('new_message');
  }

  onMessageSent(callback) {
    if (!this.socket) return;
    this.socket.on('message_sent', (data) => {
      callback(data);
    });
  }

  offMessageSent() {
    if (!this.socket) return;
    this.socket.off('message_sent');
  }
}

const socketService = new SocketService();
export default socketService;
