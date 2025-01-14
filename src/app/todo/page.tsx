'use client';

import { Layout } from '@/components/layout/Layout';
import { NoteCard } from '@/components/notes/NoteCard';
import { useNotesStore } from '@/store/notes';
import { useEffect } from 'react';

export default function Todo() {
  const { notes, fetchNotes, selectNote } = useNotesStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <Layout title="To Do">
      <div className="space-y-6">
        <div className="flex space-x-4">
          <button className="rounded-full bg-gray-100 px-4 py-1 text-sm font-medium text-gray-900">
            Job Posting (3)
          </button>
          <button className="rounded-full bg-gray-100 px-4 py-1 text-sm font-medium text-gray-900">
            Time Off Requests (4)
          </button>
          <button className="rounded-full bg-gray-100 px-4 py-1 text-sm font-medium text-gray-900">
            Time Sheet
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">iOS Developer</h3>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-xs text-gray-400">2022-01-01 - 2022-03-01</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">33500 EUR</p>
                <p className="text-sm text-gray-500">Estimated Spend</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Quality Engineer</h3>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="text-xs text-gray-400">2022-01-01 - 2022-02-28</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">47000 EUR</p>
                <p className="text-sm text-gray-500">Estimated Spend</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
