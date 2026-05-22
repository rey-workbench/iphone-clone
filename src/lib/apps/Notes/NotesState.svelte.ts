import { notesState } from '$lib/stores';
import type { Note } from '$lib/stores';

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
