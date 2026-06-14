
import type { INote } from '$lib/types';
import { notesDb, NotesDBKey } from '$lib/config/localdb';
import { SyncState } from '$lib/utils/SyncState.svelte';
import { systemGlobalState } from '$lib/os/states/systemGlobalState.svelte';
import { NotesApiClient } from '$lib/client/services/NotesApiClient';

const defaultNotes: INote[] = [
    { id: '1', title: 'Welcome to Notes', content: 'This is a sample note in your iOS 26 clone.', date: new Date() },
];

export class NotesAppState extends SyncState<INote[]> {
    selectedNote: INote | null = $state(null);
    editContent = $state('');
    editTitle = $state('');

    constructor() {
        super(notesDb, NotesDBKey.NOTES, defaultNotes, async () => {
            const userId = systemGlobalState.currentUser?.id;
            if (!userId) return [];
            const resData = await NotesApiClient.getNotes(userId);
            if (resData.success && resData.notes) {
                return resData.notes.map((n: INote) => ({ ...n, date: new Date(n.date) }));
            }
            return []; // Kembalikan kosong jika tidak ada notes
        });
    }

    protected parseCache(cached: INote[]): INote[] {
        if (!cached || !Array.isArray(cached)) return defaultNotes;
        return cached.map(n => ({ ...n, date: new Date(n.date) }));
    }

    get notes() {
        return this.data || [];
    }

    async addNote() {
        const userId = systemGlobalState.currentUser?.id;
        if (!userId) return;

        const n: INote & { user_id?: string } = { id: String(Date.now()), title: 'New Note', content: '', date: new Date(), user_id: userId };
        this.selectNote(n);

        await this.mutate(
            (current) => [n, ...current],
            async () => {
                const { res } = await NotesApiClient.saveNote(n);
                if (!res.ok) throw new Error('Failed to add note');
            }
        );
    }

    async goBack() {
        const userId = systemGlobalState.currentUser?.id;
        if (this.selectedNote && userId) {
            const updatedNote = { ...this.selectedNote, title: this.editTitle, content: this.editContent, date: new Date(), user_id: userId };

            await this.mutate(
                (current) => current.map(n => n.id === updatedNote.id ? updatedNote : n),
                async () => {
                    const { res } = await NotesApiClient.saveNote(updatedNote);
                    if (!res.ok) throw new Error('Failed to update note');
                }
            );
        }
        this.selectedNote = null;
    }

    async deleteNote(id: string) {
        const userId = systemGlobalState.currentUser?.id;
        if (!userId) return;

        this.selectedNote = null;

        await this.mutate(
            (current) => current.filter(n => n.id !== id),
            async () => {
                const { res } = await NotesApiClient.deleteNote(id, userId);
                if (!res.ok) throw new Error('Failed to delete note');
            }
        );
    }

    selectNote(note: INote) {
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
