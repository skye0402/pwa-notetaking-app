import { create } from 'zustand';
import { Note, CreateNoteInput, UpdateNoteInput } from '@/types/note';
import * as db from '@/lib/db';

interface NotesState {
  notes: Note[];
  selectedNote: Note | null;
  loading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  createNote: (note: CreateNoteInput) => Promise<void>;
  updateNote: (note: UpdateNoteInput) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  selectNote: (note: Note | null) => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  selectedNote: null,
  loading: false,
  error: null,

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const notes = await db.getAllNotes();
      set({ notes, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createNote: async (noteInput: CreateNoteInput) => {
    set({ loading: true, error: null });
    try {
      const note: Omit<Note, 'id'> = {
        ...noteInput,
        createdAt: new Date(),
        updatedAt: new Date(),
        syncStatus: 'pending',
      };
      const id = await db.createNote(note);
      const newNote = await db.getNoteById(id);
      if (newNote) {
        set((state) => ({ notes: [newNote, ...state.notes], loading: false }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateNote: async (noteInput: UpdateNoteInput) => {
    set({ loading: true, error: null });
    try {
      await db.updateNote(noteInput.id, noteInput);
      const updatedNote = await db.getNoteById(noteInput.id);
      if (updatedNote) {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteInput.id ? updatedNote : note
          ),
          loading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteNote: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await db.deleteNote(id);
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  selectNote: (note: Note | null) => {
    set({ selectedNote: note });
  },
}));
