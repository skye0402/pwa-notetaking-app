import Dexie, { Table } from 'dexie';
import { Note, CreateNoteInput, SyncStatus } from '@/types/note';

// Internal schema for Dexie table
interface NoteTableSchema {
  id?: number;
  title: string;
  content: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}

export class NotesDatabase extends Dexie {
  notes!: Table<NoteTableSchema>;

  constructor() {
    super('NotesDatabase');
    this.version(1).stores({
      notes: '++id, title, content, images, createdAt, updatedAt, syncStatus',
    });
  }
}

export const db = new NotesDatabase();

export async function getAllNotes(): Promise<Note[]> {
  const notes = await db.notes.orderBy('updatedAt').reverse().toArray();
  return notes.map(note => ({ ...note, id: note.id! } as Note));
}

export async function getNoteById(id: number): Promise<Note | undefined> {
  const note = await db.notes.get(id);
  return note ? { ...note, id } as Note : undefined;
}

export async function createNote(noteInput: CreateNoteInput): Promise<number> {
  const now = new Date();
  const note: NoteTableSchema = {
    ...noteInput,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending' as SyncStatus,
  };
  return await db.notes.add(note);
}

export async function updateNote(id: number, note: Partial<Note>): Promise<number> {
  await db.notes.update(id, { ...note, updatedAt: new Date() });
  return id;
}

export async function deleteNote(id: number): Promise<void> {
  await db.notes.delete(id);
}

// Helper function to ensure we always return a Note with an id
export function ensureNoteId(note: NoteTableSchema): Note {
  if (!note.id) {
    throw new Error('Note must have an id');
  }
  return { ...note, id: note.id };
}
