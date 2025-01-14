import Dexie, { Table } from 'dexie';
import { Note } from '@/types/note';

export class NotesDatabase extends Dexie {
  notes!: Table<Note>;

  constructor() {
    super('NotesDatabase');
    this.version(1).stores({
      notes: '++id, title, createdAt, updatedAt, syncStatus',
    });
  }
}

export const db = new NotesDatabase();

export async function getAllNotes(): Promise<Note[]> {
  return await db.notes.orderBy('updatedAt').reverse().toArray();
}

export async function getNoteById(id: number): Promise<Note | undefined> {
  return await db.notes.get(id);
}

export async function createNote(note: Omit<Note, 'id'>): Promise<number> {
  return await db.notes.add(note);
}

export async function updateNote(id: number, note: Partial<Note>): Promise<number> {
  await db.notes.update(id, { ...note, updatedAt: new Date() });
  return id;
}

export async function deleteNote(id: number): Promise<void> {
  await db.notes.delete(id);
}
