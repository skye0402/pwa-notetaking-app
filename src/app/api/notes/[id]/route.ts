import { NextRequest, NextResponse } from 'next/server';
import { readNotes, writeNotes } from '@/lib/fileOps';
import { Note } from '@/types/note';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id);
  const notes = readNotes();
  const note = notes.find((note: Note) => note.id === id);

  if (!note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id);
  const notes = readNotes();
  const noteIndex = notes.findIndex((note: Note) => note.id === id);

  if (noteIndex === -1) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  const updateData = await req.json();
  notes[noteIndex] = {
    ...notes[noteIndex],
    ...updateData,
    updatedAt: new Date(),
  };

  writeNotes(notes);
  return NextResponse.json(notes[noteIndex]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise <{ id: string }> }
) {
  const id = parseInt((await params).id);
  const notes = readNotes();

  const filteredNotes = notes.filter((note: Note) => note.id !== id);

  if (filteredNotes.length === notes.length) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }

  writeNotes(filteredNotes);
  return NextResponse.json({ success: true });
}