export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface Note {
  id: number;
  title: string;
  content: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
}

export type CreateNoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>;
export type UpdateNoteInput = Partial<CreateNoteInput> & { id: number };
