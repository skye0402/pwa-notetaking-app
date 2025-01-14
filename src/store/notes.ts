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
        // Get notes from server
        const response = await fetch('/api/notes');
        if (response.ok) {
          const serverNotes: Note[] = await response.json();
          console.log('Got notes from server:', serverNotes);
          
          // Update IndexedDB with server notes
          await Promise.all(serverNotes.map(note => 
            db.notes.put({
              ...note,
              createdAt: new Date(note.createdAt),
              updatedAt: new Date(note.updatedAt),
              syncStatus: 'synced'
            })
          ));

          set({ 
            notes: serverNotes.sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ),
            loading: false
          });
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        // Fallback to local notes if server fetch fails
        const dbNotes = await db.notes.toArray();
        const notes = dbNotes.map(note => ({
          ...ensureNoteId(note),
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        set({ 
          notes: notes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
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
