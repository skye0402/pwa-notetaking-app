import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { XMarkIcon, PhotoIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useNotesStore } from '@/store/notes';
import Image from 'next/image';
import { Note } from '@/types/note';
import { SpeechToText } from '../SpeechToText';
import { CameraPreview } from '../camera/CameraPreview';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editNote?: Note;
}

export function AddNoteModal({ isOpen, onClose, editNote }: AddNoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { addNote, updateNote } = useNotesStore();

  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title);
      setContent(editNote.content);
      setImages(editNote.images);
    } else {
      setTitle('');
      setContent('');
      setImages([]);
    }
  }, [editNote]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = (e) => {
            if (e.target?.result) {
              newImages.push(e.target.result as string);
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }

    setImages([...images, ...newImages]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editNote?.id) {
      await updateNote(editNote.id, {
        title,
        content,
        images,
      });
    } else {
      await addNote({
        title,
        content,
        images,
      });
    }
    setTitle('');
    setContent('');
    setImages([]);
    onClose();
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleCameraCapture = async () => {
    setShowCamera(true);
  };

  const handleCameraImage = (imageDataUrl: string) => {
    setImages([...images, imageDataUrl]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {editNote ? 'Edit Note' : 'Add New Note'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <div className="flex flex-col gap-2">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <SpeechToText
                onTranscript={(text) => {
                  console.log('Received transcript in AddNoteModal:', text);
                  setContent((prev) => {
                    const newContent = prev ? `${prev}\n${text}` : text;
                    console.log('Updated content:', newContent);
                    return newContent;
                  });
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Images</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative h-20 w-20">
                  <Image
                    src={image}
                    alt=""
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <PhotoIcon className="mr-2 h-5 w-5" />
                Upload Image
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCameraCapture}
              >
                <CameraIcon className="mr-2 h-5 w-5" />
                Take Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
          {showCamera && (
            <CameraPreview
              onCapture={handleCameraImage}
              onClose={() => setShowCamera(false)}
            />
          )}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editNote ? 'Update Note' : 'Save Note'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
