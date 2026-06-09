import { LocalDBAdapter } from './core';
export const notesDb = new LocalDBAdapter('myphone_notes_db', 'notes');

export const NotesDBKey = {
  NOTES: 'notes',
  AI_MESSAGES: (userId: string) => `ai_messages_${userId}`,
} as const;
