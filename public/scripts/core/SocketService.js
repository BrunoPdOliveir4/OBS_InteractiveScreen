import { eventBus } from './EventBus.js';

/**
 * SocketService - Wrapper for Socket.io client
 */
export class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  /**
   * Initialize socket connection
   * @returns {SocketService}
   */
  connect() {
    if (this.socket) return this;

    this.socket = io();

    this.socket.on('connect', () => {
      this.connected = true;
      eventBus.emit('socket:connected');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      eventBus.emit('socket:disconnected');
    });

    this.socket.on('connect-erro', (msg) => {
      eventBus.emit('socket:error', msg);
    });

    this.socket.on('welcome', (msg) => {
      eventBus.emit('socket:welcome', msg);
    });

    return this;
  }

  /**
   * Emit an event to the server
   * @param {string} event - Event name
   * @param {*} data - Data to send
   */
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  /**
   * Listen for an event from the server
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove listener for an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  /**
   * Disconnect from the server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get the underlying socket instance
   * @returns {Socket}
   */
  getSocket() {
    return this.socket;
  }
}

// Global socket service instance
export const socketService = new SocketService();
