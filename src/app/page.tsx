'use client';

import { Layout } from '@/components/layout/Layout';
import { NoteCard } from '@/components/notes/NoteCard';
import { useNotesStore } from '@/store/notes';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AddNoteModal } from '@/components/notes/AddNoteModal';

export default function Home() {
  const { notes, fetchNotes, selectNote } = useNotesStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <Layout title="Start">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">New To Dos</h2>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <PlusIcon className="mr-1 h-4 w-4" />
            Add Note
          </Button>
        </div>

        <div className="space-y-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onSelect={selectNote} />
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
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </Layout>
  );
}
