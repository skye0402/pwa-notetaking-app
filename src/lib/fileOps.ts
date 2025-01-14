import fs from 'fs';
import path from 'path';
import { Note } from '@/types/note';

const NOTES_FILE = path.join(process.cwd(), 'data', 'notes.json');

export function readNotes(): Note[] {
  try {
    const data = fs.readFileSync(NOTES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading notes:', error);
    return [];
  }
}

export function writeNotes(notes: Note[]): void {
  try {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
  } catch (error) {
    console.error('Error writing notes:', error);
  }
}
