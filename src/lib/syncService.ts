import { db, ensureNoteId } from './db';
import { Note, CreateNoteInput, SyncStatus } from '@/types/note';

export class SyncService {
  private eventSource: EventSource | null = null;
  private onUpdateCallback: (() => void) | null = null;
  private syncInProgress = false;
  private onlineStatus = typeof window !== 'undefined' ? window.navigator.onLine : true;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      // Setup SSE after a short delay to ensure proper initialization
      setTimeout(() => this.setupEventSource(), 1000);
    }
  }

  private handleOnline = () => {
    console.log('Online: Resuming sync');
    this.onlineStatus = true;
    this.reconnectAttempts = 0;
    this.setupEventSource();
    this.syncWithServer();
  };

  private handleOffline = () => {
    console.log('Offline: Pausing sync');
    this.onlineStatus = false;
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  };

  private setupEventSource() {
    if (!this.onlineStatus || this.eventSource) return;

    console.log('Setting up EventSource');
    this.eventSource = new EventSource('/api/notes/sync');
    this.eventSource.onopen = this.onopen;
    this.eventSource.onmessage = this.onmessage;
    this.eventSource.onerror = this.onerror;
  }

  private onopen = () => {
    console.log('EventSource connected');
    this.reconnectAttempts = 0;
  };

  private onmessage = async (event: MessageEvent) => {
    console.log('Received message:', event.data);
    if (event.data === 'connected') {
      console.log('SSE connection established');
      return;
    }

    try {
      // Parse data to validate it's JSON, but we don't need the actual data
      JSON.parse(event.data);
      await this.syncWithServer();
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  private onerror = (error: Event) => {
    console.error('EventSource error:', error);
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.attemptReconnect();
  };

  private attemptReconnect() {
    if (this.reconnectTimeout || !this.onlineStatus) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Attempting to reconnect in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.reconnectAttempts++;
      this.setupEventSource();
    }, delay);
  }

  setUpdateCallback(callback: () => void) {
    this.onUpdateCallback = callback;
  }

  private notifyChange() {
    if (this.onUpdateCallback) {
      console.log('Triggering update callback');
      this.onUpdateCallback();
    }
  }

  async syncWithServer(): Promise<void> {
    if (this.syncInProgress || !this.onlineStatus) return;

    console.log('Starting sync');
    this.syncInProgress = true;

    try {
      const localNotes = await db.notes.toArray();
      const pendingNotes = localNotes.filter(note => note.id && note.syncStatus === 'pending').map(ensureNoteId);

      // First, sync pending notes
      if (pendingNotes.length > 0) {
        console.log('Syncing pending notes:', pendingNotes);
        const response = await fetch('/api/notes/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingNotes),
        });

        if (!response.ok) {
          throw new Error('Failed to sync pending notes');
        }

        // Mark synced notes
        for (const note of pendingNotes) {
          await db.notes.update(note.id, { syncStatus: 'synced' as SyncStatus });
        }
      }

      // Then get all notes from server
      const response = await fetch('/api/notes');
      if (!response.ok) {
        throw new Error('Failed to fetch notes from server');
      }

      const serverNotes: Note[] = await response.json();
      console.log('Received server notes:', serverNotes);

      // Update local notes
      for (const serverNote of serverNotes) {
        const localNote = localNotes.find(note => note.id === serverNote.id);
        if (!localNote || localNote.syncStatus !== 'pending') {
          await db.notes.put({
            ...serverNote,
            createdAt: new Date(serverNote.createdAt),
            updatedAt: new Date(serverNote.updatedAt),
            syncStatus: 'synced' as SyncStatus
          });
        }
      }

      // Delete notes that don't exist on server (unless pending)
      const serverNoteIds = new Set(serverNotes.map(note => note.id));
      for (const localNote of localNotes) {
        const note = ensureNoteId(localNote);
        if (!serverNoteIds.has(note.id) && note.syncStatus !== 'pending') {
          await db.notes.delete(note.id);
        }
      }

      this.notifyChange();
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      this.syncInProgress = false;
      console.log('Sync completed');
    }
  }

  async addNote(noteInput: CreateNoteInput): Promise<Note> {
    const id = await db.notes.add({
      ...noteInput,
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending' as SyncStatus,
    });

    const note = await db.notes.get(id);
    if (!note) {
      throw new Error('Failed to create note');
    }

    this.syncWithServer();
    return ensureNoteId(note);
  }

  async updateNote(id: number, noteInput: Partial<CreateNoteInput>): Promise<void> {
    await db.notes.update(id, {
      ...noteInput,
      updatedAt: new Date(),
      syncStatus: 'pending' as SyncStatus,
    });

    this.syncWithServer();
  }

  async deleteNote(id: number): Promise<void> {
    await db.notes.delete(id);
    this.syncWithServer();
  }
}

export const syncService = new SyncService();
