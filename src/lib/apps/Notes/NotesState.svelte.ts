import { ApiConfig } from '$lib/config/api';
import type { Note } from '$lib/types';
import { notesDb, NotesDBKey } from '$lib/config/localdb';
import { SyncState } from '$lib/utils/SyncState.svelte';

const defaultNotes: Note[] = [
    { id: '1', title: 'Welcome to Notes', content: 'This is a sample note in your iOS 26 clone.', date: new Date() },
];

export class AppNotesState extends SyncState<Note[]> {
    selectedNote: Note | null = $state(null);
    editContent = $state('');
    editTitle = $state('');

    constructor() {
        super(notesDb, NotesDBKey.NOTES, defaultNotes, async () => {
            const r = await fetch(ApiConfig.NOTES);
            const resData = await r.json();
            if (resData.success && resData.notes) {
                return resData.notes.map((n: any) => ({ ...n, date: new Date(n.date) }));
            }
            return []; // Kembalikan kosong jika tidak ada notes
        });
    }

    protected parseCache(cached: any): Note[] {
        if (!cached || !Array.isArray(cached)) return defaultNotes;
        return cached.map(n => ({ ...n, date: new Date(n.date) }));
    }

    get notes() {
        return this.data || [];
    }

    async addNote() {
        const n: Note = { id: String(Date.now()), title: 'New Note', content: '', date: new Date() };
        this.selectNote(n);

        await this.mutate(
            (current) => [n, ...current],
            async () => {
                const res = await fetch(ApiConfig.NOTES, ApiConfig.getNotesRequest('POST', n));
                if (!res.ok) throw new Error('Failed to add note');
            }
        );
    }

    async goBack() {
        if (this.selectedNote) {
            const updatedNote = { ...this.selectedNote, title: this.editTitle, content: this.editContent, date: new Date() };

            await this.mutate(
                (current) => current.map(n => n.id === updatedNote.id ? updatedNote : n),
                async () => {
                    const res = await fetch(ApiConfig.NOTES, ApiConfig.getNotesRequest('POST', updatedNote));
                    if (!res.ok) throw new Error('Failed to update note');
                }
            );
        }
        this.selectedNote = null;
    }

    async deleteNote(id: string) {
        this.selectedNote = null;

        await this.mutate(
            (current) => current.filter(n => n.id !== id),
            async () => {
                const res = await fetch(ApiConfig.NOTES, ApiConfig.getNotesRequest('DELETE', { id }));
                if (!res.ok) throw new Error('Failed to delete note');
            }
        );
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
