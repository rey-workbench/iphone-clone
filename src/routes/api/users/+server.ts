import { apiWrapper } from '$lib/backend/api';
import { UsersService } from '$lib/backend/services/UsersService';

const usersService = new UsersService();

export const GET = apiWrapper(async () => {
	const users = await usersService.getAllUsers();
	return { users };
}, { requireAuth: false });
