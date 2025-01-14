'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Note } from '@/types/note';
import { useNotesStore } from '@/store/notes';
import { CloudArrowUpIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onClick?: () => void;
}

export function NoteCard({ note, onEdit, onClick }: NoteCardProps) {
  const [showSyncIcon, setShowSyncIcon] = useState(note.syncStatus === 'pending');
  const deleteNote = useNotesStore((state) => state.deleteNote);

  useEffect(() => {
    if (note.syncStatus === 'pending') {
      setShowSyncIcon(true);
    } else if (note.syncStatus === 'synced') {
      const timer = setTimeout(() => {
        setShowSyncIcon(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShowSyncIcon(false);
    }
  }, [note.syncStatus]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(note);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNote(note.id);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="group relative cursor-pointer rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-lg font-semibold">{note.title}</h3>
        <div className="flex items-center space-x-2">
          {showSyncIcon && (
            <CloudArrowUpIcon className="h-5 w-5 animate-pulse text-blue-500" />
          )}
          <div className="flex space-x-1">
            <button
              onClick={handleEdit}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <p className="mb-4 line-clamp-3 text-gray-600">{note.content}</p>
      {note.images && note.images.length > 0 && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          {note.images.slice(0, 4).map((image, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={image}
                alt=""
                fill
                className="rounded object-cover"
              />
            </div>
          ))}
        </div>
      )}
      <div className="text-xs text-gray-500">
        {formatDate(note.updatedAt)}
      </div>
    </div>
  );
}
