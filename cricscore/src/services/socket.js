import { io } from 'socket.io-client';

/**
 * Socket.io Client Service
 * Manages WebSocket connections for real-time updates
 */

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Match viewer methods
  joinMatch(matchId) {
    if (!this.socket) this.connect();
    this.socket.emit('match:join', { matchId });
  }

  leaveMatch(matchId) {
    if (!this.socket) return;
    this.socket.emit('match:leave', { matchId });
  }

  subscribeToLiveUpdates(matchId) {
    if (!this.socket) this.connect();
    this.socket.emit('match:subscribe', { matchId });
  }

  unsubscribeFromLiveUpdates(matchId) {
    if (!this.socket) return;
    this.socket.emit('match:unsubscribe', { matchId });
  }

  requestMatchState(matchId) {
    if (!this.socket) this.connect();
    this.socket.emit('match:getState', { matchId });
  }

  // Scorer methods
  authenticateScorer(matchId, token) {
    if (!this.socket) this.connect();
    this.socket.emit('scorer:auth', { matchId, token });
  }

  scorerHeartbeat() {
    if (!this.socket) return;
    this.socket.emit('scorer:heartbeat');
  }

  // Event listeners
  on(event, callback) {
    if (!this.socket) this.connect();

    // Store callback for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);

      // Remove from listeners map
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    } else {
      this.socket.off(event);
      this.listeners.delete(event);
    }
  }

  // Convenience methods for common events
  onMatchUpdate(callback) {
    this.on('match:update', callback);
  }

  onScoreUpdate(callback) {
    this.on('score:update', callback);
  }

  onNewBall(callback) {
    this.on('ball:new', callback);
  }

  onNewCommentary(callback) {
    this.on('commentary:new', callback);
  }

  onInningsEnd(callback) {
    this.on('innings:end', callback);
  }

  onMatchEnd(callback) {
    this.on('match:end', callback);
  }

  onScorerAuthSuccess(callback) {
    this.on('scorer:auth:success', callback);
  }

  onScorerAuthFailed(callback) {
    this.on('scorer:auth:failed', callback);
  }

  onMatchJoined(callback) {
    this.on('match:joined', callback);
  }

  onMatchState(callback) {
    this.on('match:state', callback);
  }

  // Check connection status
  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
