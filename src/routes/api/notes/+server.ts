import { apiWrapper, ApiError } from '$lib/backend/api';
import { NotesService } from '$lib/backend/services/NotesService';
import { isAuthorized } from '$lib/backend/security/AuthValidator';
import { NoteSchema, DeleteNoteSchema } from '$lib/backend/validation/Validation';

const notesService = new NotesService();

export const GET = apiWrapper(async ({ url, request }) => {
	const userId = url.searchParams.get('userId');
	if (!userId) throw new ApiError(400, 'User ID is required');

	if (!(await isAuthorized(request, userId))) {
		throw new ApiError(403, 'Unauthorized access to user notes');
	}

	const notes = await notesService.getUserNotes(userId);
	return { notes };
});

export const POST = apiWrapper(async ({ request }) => {
	const body = await request.json();
	const data = NoteSchema.parse(body);

	if (!(await isAuthorized(request, data.user_id))) {
		throw new ApiError(403, 'Unauthorized to save notes for this user');
	}

	await notesService.saveNote(data);
	return {};
});

export const DELETE = apiWrapper(async ({ request }) => {
	const body = await request.json();
	const data = DeleteNoteSchema.parse(body);

	if (!(await isAuthorized(request, data.user_id))) {
		throw new ApiError(403, 'Unauthorized to delete notes for this user');
	}

	await notesService.deleteNote(data.id, data.user_id);
	return {};
});
