import { json } from '@sveltejs/kit';
import { apiHandler } from '$lib/server/api';
import { NotesService } from '$lib/server/services/NotesService';

const notesService = new NotesService();

export function GET({ url }) {
  return apiHandler(async () => {
    const userId = url.searchParams.get('userId');
    const notes = await notesService.getUserNotes(userId);
    return { notes };
  });
}

export function POST({ request }) {
  return apiHandler(async () => {
    const data = await request.json();
    await notesService.saveNote(data);
    return {};
  });
}

export function DELETE({ request }) {
  return apiHandler(async () => {
    const { id, user_id } = await request.json();
    await notesService.deleteNote(id, user_id);
    return {};
  });
}
