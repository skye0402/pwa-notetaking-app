import { Note } from '@/types/note';
import { format } from 'date-fns';
import { EllipsisHorizontalIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useState } from 'react';
import { useNotesStore } from '@/store/notes';

interface NoteCardProps {
  note: Note;
  onSelect: (note: Note) => void;
}

export function NoteCard({ note, onSelect }: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { deleteNote } = useNotesStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.id) {
      await deleteNote(note.id);
    }
    setShowMenu(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(note);
    setShowMenu(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div
      className="relative rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onSelect(note)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {note.images && note.images[0] && (
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={note.images[0]}
                alt=""
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{note.title}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {format(new Date(note.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <div className="relative">
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={toggleMenu}
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleEdit}
              >
                <PencilIcon className="mr-3 h-4 w-4" />
                Edit
              </button>
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={handleDelete}
              >
                <TrashIcon className="mr-3 h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{note.content}</p>
      {note.images && note.images.length > 1 && (
        <div className="mt-3 flex -space-x-2 overflow-hidden">
          {note.images.slice(1).map((image, index) => (
            <div key={index} className="h-8 w-8 rounded-full border-2 border-white">
              <Image
                src={image}
                alt=""
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      {note.syncStatus === 'pending' && (
        <div className="absolute bottom-2 right-2">
          <span className="text-xs text-orange-500">Syncing...</span>
        </div>
      )}
    </div>
  );
}
