type MessageType = 'NOTES_UPDATED' | 'NOTES_DELETED';

type BroadcastMessage = {
  type: MessageType;
  data?: unknown;
};

interface BroadcastCallback {
  (message: BroadcastMessage): void;
}

class ServerBroadcastService {
  private listeners: Map<MessageType, Set<BroadcastCallback>> = new Map();
  private activeConnections = new Set<BroadcastCallback>();

  subscribe(type: MessageType, callback: BroadcastCallback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    const typeListeners = this.listeners.get(type)!;
    typeListeners.add(callback);
    this.activeConnections.add(callback);

    return () => {
      typeListeners.delete(callback);
      this.activeConnections.delete(callback);
      // Clean up empty listener sets
      if (typeListeners.size === 0) {
        this.listeners.delete(type);
      }
    };
  }

  broadcast(type: MessageType, data?: unknown) {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      const deadConnections = new Set<BroadcastCallback>();

      // Try to notify each listener
      typeListeners.forEach(listener => {
        try {
          if (this.activeConnections.has(listener)) {
            listener({ type, data });
          } else {
            deadConnections.add(listener);
          }
        } catch (error) {
          console.error('Error notifying listener:', error);
          deadConnections.add(listener);
        }
      });

      // Clean up dead connections
      deadConnections.forEach(listener => {
        typeListeners.delete(listener);
        this.activeConnections.delete(listener);
      });

      // Clean up empty listener sets
      if (typeListeners.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  cleanup() {
    this.listeners.clear();
    this.activeConnections.clear();
  }

  getActiveConnectionCount() {
    return this.activeConnections.size;
  }
}

export const serverBroadcastService = new ServerBroadcastService();
