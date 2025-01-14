export interface Note {
  id?: number;
  title: string;
  content: string;
  images?: string[];  // Base64 encoded images or URLs
  createdAt: Date;
  updatedAt: Date;
  syncStatus?: 'pending' | 'synced' | 'failed';
}

export type CreateNoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>;
export type UpdateNoteInput = Partial<CreateNoteInput> & { id: number };
