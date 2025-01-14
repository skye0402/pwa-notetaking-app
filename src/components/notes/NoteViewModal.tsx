import { Note } from '@/types/note';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

interface NoteViewModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
}

export function NoteViewModal({ note, isOpen, onClose }: NoteViewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={modalRef}
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{note.title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <p className="whitespace-pre-wrap text-lg text-gray-600">{note.content}</p>

          {note.images && note.images.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {note.images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 text-sm text-gray-500">
            <p className="mb-1">
              <span className="font-medium">Created:</span> {formatDate(note.createdAt)}
            </p>
            <p>
              <span className="font-medium">Last modified:</span> {formatDate(note.updatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
