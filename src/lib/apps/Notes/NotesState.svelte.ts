import { ApiConfig } from '$lib/config/api';
import type { Note } from '$lib/types';

const defaultNotes: Note[] = [
  { id: '1', title: 'Welcome to Notes', content: 'This is a sample note in your iOS 26 clone.', date: new Date() },
];

export class NotesState {
  notes = $state<Note[]>(defaultNotes);

  constructor() {
    if (typeof window !== 'undefined') {
      fetch(ApiConfig.NOTES)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.notes && data.notes.length > 0) {
            this.notes = data.notes.map((n: any) => ({ ...n, date: new Date(n.date) }));
          }
        })
        .catch(console.error);
    }
  }

  async addNote(note: Note) {
    this.notes = [note, ...this.notes];
    await fetch(ApiConfig.NOTES, ApiConfig.getNotesRequest('POST', note)).catch(console.error);
  }

  async updateNote(note: Note) {
    this.notes = this.notes.map(n => n.id === note.id ? note : n);
    await fetch(ApiConfig.NOTES, ApiConfig.getNotesRequest('POST', note)).catch(console.error);
  }

  async deleteNote(id: string) {
    this.notes = this.notes.filter(n => n.id !== id);
    await fetch(ApiConfig.NOTES, ApiConfig.getNotesRequest('DELETE', { id })).catch(console.error);
  }
}

export const notesState = new NotesState();

export class AppNotesState {
    selectedNote: Note | null = $state(null);
    editContent = $state('');
    editTitle = $state('');

    constructor() {}

    selectNote(note: Note) {
        this.selectedNote = note;
        this.editTitle = note.title;
        this.editContent = note.content;
    }

    goBack() {
        if (this.selectedNote) {
            const updatedNote = { ...this.selectedNote, title: this.editTitle, content: this.editContent, date: new Date() };
            notesState.updateNote(updatedNote);
        }
        this.selectedNote = null;
    }

    addNote() {
        const n: Note = { id: String(Date.now()), title: 'New Note', content: '', date: new Date() };
        notesState.addNote(n);
        this.selectNote(n);
    }

    deleteNote(id: string) {
        notesState.deleteNote(id);
        this.selectedNote = null;
    }

    fmtDate(d: Date) {
        const now = new Date();
        return d.toDateString() === now.toDateString()
            ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}
