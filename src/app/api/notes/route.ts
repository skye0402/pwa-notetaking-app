import { NextResponse } from 'next/server';
import { Note } from '@/types/note';
import fs from 'fs';
import path from 'path';

// Store notes in a JSON file for persistence
const NOTES_FILE = path.join(process.cwd(), 'data', 'notes.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

// Initialize notes file if it doesn't exist
if (!fs.existsSync(NOTES_FILE)) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
}

function readNotes(): Note[] {
  try {
    const data = fs.readFileSync(NOTES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading notes:', error);
    return [];
  }
}

function writeNotes(notes: Note[]) {
  try {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
  } catch (error) {
    console.error('Error writing notes:', error);
  }
}

export async function GET() {
  const notes = readNotes();
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const note = await request.json();
  const notes = readNotes();
  const newNote = {
    ...note,
    id: Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced',
  };
  notes.push(newNote);
  writeNotes(notes);
  return NextResponse.json(newNote);
}

export async function PUT(request: Request) {
  const updatedNote = await request.json();
  const notes = readNotes();
  const index = notes.findIndex((n) => n.id === updatedNote.id);
  
  if (index === -1) {
    // If note doesn't exist, create it
    const newNote = {
      ...updatedNote,
      id: updatedNote.id || Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced',
    };
    notes.push(newNote);
    writeNotes(notes);
    return NextResponse.json(newNote);
  }

  // Update existing note
  notes[index] = {
    ...notes[index],
    ...updatedNote,
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced',
  };
  writeNotes(notes);
  return NextResponse.json(notes[index]);
}
