import { create } from 'zustand';
import { Note, CreateNoteInput, SyncStatus } from '@/types/note';
import { db, ensureNoteId } from '@/lib/db';
import { syncService } from '@/lib/syncService';

interface NotesState {
  notes: Note[];
  loading: boolean;
  fetchNotes: () => Promise<void>;
  addNote: (note: CreateNoteInput) => Promise<void>;
  updateNote: (id: number, note: Partial<CreateNoteInput>) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set) => {
  // Set up sync service callback
  if (typeof window !== 'undefined') {
    syncService.setUpdateCallback(async () => {
      console.log('Sync callback triggered, updating store');
      const dbNotes = await db.notes.toArray();
      const notes = dbNotes.map(note => ({
        ...ensureNoteId(note),
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      set({ 
        notes: notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) 
      });
    });
  }

  return {
    notes: [],
    loading: false,

    fetchNotes: async () => {
      console.log('Fetching notes from store');
      set({ loading: true });
      try {
        // Get notes from server
        const response = await fetch('/api/notes');
        if (!response.ok) {
          throw new Error('Failed to fetch notes from server');
        }
        const serverNotes = await response.json() as Note[];

        // Get local notes to check for pending changes
        const localNotes = await db.notes.toArray() as Note[];
        const pendingNotes = localNotes.filter(note => note.syncStatus === 'pending');

        // Merge server notes with pending local notes
        const mergedNotes: Note[] = serverNotes.map(serverNote => {
          const pendingNote = pendingNotes.find(note => note.id === serverNote.id);
          if (pendingNote) return pendingNote;
          
          return {
            ...serverNote,
            id: serverNote.id,
            createdAt: new Date(serverNote.createdAt),
            updatedAt: new Date(serverNote.updatedAt),
            syncStatus: 'synced' as SyncStatus
          };
        });

        // Update IndexedDB
        await db.notes.clear();
        await Promise.all(mergedNotes.map(note => db.notes.put(note)));

        set({
          notes: mergedNotes.sort((a: Note, b: Note) => b.updatedAt.getTime() - a.updatedAt.getTime()),
          loading: false
        });
      } catch (error) {
        console.error('Error fetching notes:', error);
        // If server fetch fails, use local notes
        const localNotes = await db.notes.toArray() as Note[];
        set({
          notes: localNotes
            .map(note => ({
              ...note,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt)
            }))
            .sort((a: Note, b: Note) => b.updatedAt.getTime() - a.updatedAt.getTime()),
          loading: false
        });
      }
    },

    addNote: async (noteInput: CreateNoteInput) => {
      const note = await syncService.addNote(noteInput);
      set(state => ({
        notes: [note, ...state.notes]
      }));
    },

    updateNote: async (id: number, noteInput: Partial<CreateNoteInput>) => {
      await syncService.updateNote(id, noteInput);
      // Let the sync callback handle the store update
    },

    deleteNote: async (id: number) => {
      await syncService.deleteNote(id);
      set(state => ({
        notes: state.notes.filter(note => note.id !== id)
      }));
    },
  };
});
