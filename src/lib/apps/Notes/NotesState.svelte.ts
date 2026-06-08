import { ApiConfig } from '$lib/config/api';
import type { Note } from '$lib/types';

const defaultNotes: Note[] = [
  { id: '1', title: 'Welcome to Notes', content: 'This is a sample note in your iOS 26 clone.', date: new Date() },
];

export class AppNotesState {
    notes = $state<Note[]>(defaultNotes);
    selectedNote: Note | null = $state(null);
    editContent = $state('');
    editTitle = $state('');
    private isLoaded = false;

    constructor() {}

    async load() {
        if (typeof window === 'undefined' || this.isLoaded) return;
        this.isLoaded = true;
        try {
            const r = await fetch(ApiConfig.NOTES);
            const data = await r.json();
            if (data.success && data.notes && data.notes.length > 0) {
                this.notes = data.notes.map((n: any) => ({ ...n, date: new Date(n.date) }));
            }
        } catch (e) {
            console.error(e);
        }
    }

    async addNote() {
        const n: Note = { id: String(Date.now()), title: 'New Note', content: '', date: new Date() };
        const original = this.notes;
        this.notes = [n, ...this.notes];
        this.selectNote(n);

        try {
            const res = await fetch(ApiConfig.NOTES, ApiConfig.getNotesRequest('POST', n));
            if (!res.ok) throw new Error('Failed to add note');
        } catch (e) {
            console.error(e);
            this.notes = original;
        }
    }

    async goBack() {
        if (this.selectedNote) {
            const updatedNote = { ...this.selectedNote, title: this.editTitle, content: this.editContent, date: new Date() };
            const original = this.notes;
            this.notes = this.notes.map(n => n.id === updatedNote.id ? updatedNote : n);
            
            try {
                const res = await fetch(ApiConfig.NOTES, ApiConfig.getNotesRequest('PUT', updatedNote));
                if (!res.ok) throw new Error('Failed to update note');
            } catch (e) {
                console.error(e);
                this.notes = original;
            }
        }
        this.selectedNote = null;
    }

    async deleteNote(id: string) {
        const original = this.notes;
        this.notes = this.notes.filter(n => n.id !== id);
        this.selectedNote = null;

        try {
            const res = await fetch(ApiConfig.NOTES, ApiConfig.getNotesRequest('DELETE', { id }));
            if (!res.ok) throw new Error('Failed to delete note');
        } catch (e) {
            console.error(e);
            this.notes = original;
        }
    }

    selectNote(note: Note) {
        this.selectedNote = note;
        this.editTitle = note.title;
        this.editContent = note.content;
    }

    fmtDate(d: Date) {
        const now = new Date();
        return d.toDateString() === now.toDateString()
            ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}
