import { create } from 'zustand';
import { Note, CreateNoteInput } from '@/types/note';
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
        // Get initial notes from IndexedDB
        const dbNotes = await db.notes.toArray();
        const notes = dbNotes.map(note => ({
          ...ensureNoteId(note),
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        set({ 
          notes: notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()) 
        });
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        set({ loading: false });
      }
    },

    addNote: async (noteInput: CreateNoteInput) => {
      const note = await syncService.addNote(noteInput);
      set(state => ({
        notes: [note, ...state.notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      }));
    },

    updateNote: async (id: number, noteInput: Partial<CreateNoteInput>) => {
      await syncService.updateNote(id, noteInput);
      // Note: The sync callback will update the store
    },

    deleteNote: async (id: number) => {
      await syncService.deleteNote(id);
      set(state => ({
        notes: state.notes.filter(note => note.id !== id)
      }));
    }
  };
});
