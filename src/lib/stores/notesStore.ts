import { writable } from 'svelte/store';

export interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
}

const defaultNotes: Note[] = [
  { id: '1', title: 'Welcome to Notes', content: 'This is a sample note in your iOS 26 clone.', date: new Date() },
];

function createNotesStore() {
  const { subscribe, set, update } = writable<Note[]>(defaultNotes);

  if (typeof window !== 'undefined') {
    fetch('/api/notes').then(r => r.json()).then(data => {
      if (data.success && data.notes && data.notes.length > 0) {
        set(data.notes.map((n: any) => ({ ...n, date: new Date(n.date) })));
      }
    }).catch(console.error);
  }

  return {
    subscribe,
    set,
    update,
    addNote: async (note: Note) => {
      update(n => [note, ...n]);
      await fetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify(note)
      }).catch(console.error);
    },
    updateNote: async (note: Note) => {
      update(notes => notes.map(n => n.id === note.id ? note : n));
      await fetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify(note)
      }).catch(console.error);
    },
    deleteNote: async (id: string) => {
      update(notes => notes.filter(n => n.id !== id));
      await fetch('/api/notes', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      }).catch(console.error);
    }
  };
}

export const notesState = createNotesStore();
