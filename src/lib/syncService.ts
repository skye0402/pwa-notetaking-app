import { db } from './db';
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
  private lastSyncTime = 0;
  private lastOperation: { type: string; id?: number; timestamp: number } | null = null;

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
    this.syncPendingNotes(); // Try to sync pending notes when we come online
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
      // Parse data to validate it's JSON
      const data = JSON.parse(event.data);
      
      // Check if this is a response to our own operation
      if (this.lastOperation) {
        const timeSinceOperation = Date.now() - this.lastOperation.timestamp;
        if (timeSinceOperation < 2000) { // Within 2 seconds
          if (data.length === 1) {
            const note = data[0];
            if (note.deleted && this.lastOperation.type === 'delete' && note.id === this.lastOperation.id) {
              console.log('Ignoring sync for own delete operation');
              return;
            }
            if (!note.deleted && this.lastOperation.type === 'add' && note.id === this.lastOperation.id) {
              console.log('Ignoring sync for own add operation');
              return;
            }
          }
        }
      }

      // If it's a delete operation, just delete the note locally
      if (data.length === 1 && data[0].deleted) {
        const noteId = data[0].id;
        await db.notes.delete(noteId);
        this.notifyChange();
        return;
      }

      // Otherwise get latest notes from server
      const response = await fetch('/api/notes');
      if (!response.ok) {
        throw new Error('Failed to fetch notes from server');
      }

      const serverNotes: Note[] = await response.json();
      console.log('Received server notes:', serverNotes);

      // Update local notes
      await Promise.all(serverNotes.map(note => 
        db.notes.put({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          syncStatus: 'synced' as SyncStatus
        })
      ));

      this.notifyChange();
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

  async addNote(noteInput: CreateNoteInput): Promise<Note> {
    // Create a new note object with a temporary ID and sync status
    const tempNote: Note = {
      ...noteInput,
      id: Date.now(), // Use timestamp as temporary ID
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'pending' as SyncStatus
    };

    try {
      // Always save to IndexedDB first
      await db.notes.put(tempNote);
      
      // If we're offline, return the temporary note
      if (!this.onlineStatus) {
        console.log('Offline: Saved note locally, will sync later');
        this.notifyChange();
        return tempNote;
      }

      // If we're online, try to sync with the server
      try {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteInput),
        });

        if (!response.ok) {
          throw new Error('Failed to add note to server');
        }

        const serverNote = await response.json();
        
        // Update the local note with the server response
        await db.notes.delete(tempNote.id);
        await db.notes.put({
          ...serverNote,
          createdAt: new Date(serverNote.createdAt),
          updatedAt: new Date(serverNote.updatedAt),
          syncStatus: 'synced' as SyncStatus
        });

        // Record this operation
        this.lastOperation = { type: 'add', id: serverNote.id, timestamp: Date.now() };

        // Notify other clients about the new note
        await fetch('/api/notes/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([serverNote]),
        });

        this.notifyChange();
        return serverNote;
      } catch (error) {
        console.error('Error syncing note with server:', error);
        // Keep the local note with pending status
        this.notifyChange();
        return tempNote;
      }
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }

  private async syncPendingNotes() {
    if (!this.onlineStatus || this.syncInProgress) return;

    this.syncInProgress = true;
    try {
      // Get all pending notes
      const pendingNotes = await db.notes
        .where('syncStatus')
        .equals('pending')
        .toArray();

      for (const note of pendingNotes) {
        try {
          const { id, createdAt, updatedAt, syncStatus, ...noteInput } = note;
          const response = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteInput),
          });

          if (!response.ok) {
            throw new Error('Failed to sync note with server');
          }

          const serverNote = await response.json();
          
          // Update local note with server data
          await db.notes.delete(note.id);
          await db.notes.put({
            ...serverNote,
            createdAt: new Date(serverNote.createdAt),
            updatedAt: new Date(serverNote.updatedAt),
            syncStatus: 'synced' as SyncStatus
          });

          // Notify other clients
          await fetch('/api/notes/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([serverNote]),
          });
        } catch (error) {
          console.error(`Error syncing note ${note.id}:`, error);
        }
      }
    } finally {
      this.syncInProgress = false;
      this.notifyChange();
    }
  }

  async updateNote(id: number, noteInput: Partial<CreateNoteInput>): Promise<void> {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteInput),
      });

      if (!response.ok) {
        throw new Error('Failed to update note on server');
      }

      const serverNote = await response.json();
      await db.notes.put({
        ...serverNote,
        createdAt: new Date(serverNote.createdAt),
        updatedAt: new Date(serverNote.updatedAt),
        syncStatus: 'synced' as SyncStatus
      });

      // Record this operation
      this.lastOperation = { type: 'update', id, timestamp: Date.now() };

      // Notify other clients about the change
      await fetch('/api/notes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([serverNote]),
      });

      this.notifyChange();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }

  async deleteNote(id: number): Promise<void> {
    try {
      // Delete from server first
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note from server');
      }

      // Then delete locally
      await db.notes.delete(id);

      // Record this operation
      this.lastOperation = { type: 'delete', id, timestamp: Date.now() };

      // Notify other clients about the deletion
      await fetch('/api/notes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ id, deleted: true }]),
      });

      // Make sure to update the local store
      this.notifyChange();
    } catch (error) {
      console.error('Error deleting note:', error);
      // If server deletion fails, revert the local deletion
      const note = await db.notes.get(id);
      if (note) {
        await db.notes.put({ ...note, syncStatus: 'pending' as SyncStatus });
        this.notifyChange();
      }
      throw error;
    }
  }
}

export const syncService = new SyncService();
