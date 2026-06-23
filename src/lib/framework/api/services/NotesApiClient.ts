import type { INote } from '$lib/framework/types';
import { ApiConfig, apiFetch } from '$lib/framework/api/api';

export class NotesApiClient {
	static async getNotes(userId: string) {
		const r = await apiFetch(`${ApiConfig.NOTES}?userId=${userId}`);
		return await r.json();
	}

	static async saveNote(note: INote & { user_id?: string }) {
		const res = await apiFetch(ApiConfig.NOTES, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(note)
		});
		return { res, result: res.ok ? await res.json() : null };
	}

	static async deleteNote(id: string, userId: string) {
		const res = await apiFetch(ApiConfig.NOTES, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, user_id: userId })
		});
		return { res, result: res.ok ? await res.json() : null };
	}
}
