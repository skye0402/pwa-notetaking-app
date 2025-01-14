'use client';

import { AddNoteModal } from '@/components/notes/AddNoteModal';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteViewModal } from '@/components/notes/NoteViewModal';
import { useNotesStore } from '@/store/notes';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Note } from '@/types/note';
import { Layout } from '@/components/layout/Layout';

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const { notes, fetchNotes } = useNotesStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedNote(undefined);
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setShowViewModal(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">New To Dos</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Note
          </button>
        </div>

        <div className="space-y-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEdit}
              onClick={() => handleNoteClick(note)}
            />
          ))}
          {notes.length === 0 && (
            <p className="text-center text-gray-500">No notes yet. Create your first note!</p>
          )}
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Monitoring Apps</h3>
          <div className="space-y-4">
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Manage My Timesheet</h4>
                  <p className="text-sm text-gray-500">Hours Missing</p>
                  <p className="text-xs text-gray-400">SAP S/4HANA</p>
                </div>
                <span className="text-2xl font-semibold">0</span>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">My Inbox</h4>
                  <p className="text-sm text-gray-500">All Items</p>
                  <p className="text-xs text-gray-400">SAP S/4HANA</p>
                </div>
                <span className="text-2xl font-semibold">11</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddNoteModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        editNote={selectedNote}
      />

      {selectedNote && (
        <NoteViewModal
          note={selectedNote}
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedNote(undefined);
          }}
        />
      )}
    </Layout>
  );
}
