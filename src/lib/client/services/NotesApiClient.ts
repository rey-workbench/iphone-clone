import { ApiConfig } from '$lib/config/api';
import type { INote } from '$lib/types';

export class NotesApiClient {
    static async getNotes(userId: string) {
        const r = await fetch(`${ApiConfig.NOTES}?userId=${userId}`);
        return await r.json();
    }

    static async saveNote(note: INote & { user_id?: string }) {
        const res = await fetch(ApiConfig.NOTES, ApiConfig.getNotesRequest('POST', note));
        return { res, result: res.ok ? await res.json() : null };
    }

    static async deleteNote(id: string, userId: string) {
        const res = await fetch(ApiConfig.NOTES, ApiConfig.getNotesRequest('DELETE', { id, user_id: userId }));
        return { res, result: res.ok ? await res.json() : null };
    }
}
