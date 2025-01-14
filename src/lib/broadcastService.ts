'use client';

type MessageType = 'NOTES_UPDATED' | 'NOTES_DELETED';

type BroadcastMessage = {
  type: MessageType;
  data?: unknown;
};

interface BroadcastCallback {
  (message: BroadcastMessage): void;
}

class BroadcastService {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<MessageType, Set<BroadcastCallback>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.channel = new BroadcastChannel('notes-sync');
      this.channel.onmessage = this.handleMessage;
    }
  }

  private handleMessage = (event: MessageEvent<BroadcastMessage>) => {
    const { type, data } = event.data;
    this.notifyListeners(type, data);
  };

  private notifyListeners(type: MessageType, data?: unknown) {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach(listener => listener({ type, data }));
    }
  }

  subscribe(type: MessageType, callback: BroadcastCallback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        typeListeners.delete(callback);
      }
    };
  }

  broadcast(type: MessageType, data?: unknown) {
    if (this.channel) {
      this.channel.postMessage({ type, data });
    }
  }

  cleanup() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

export const broadcastService = new BroadcastService();
