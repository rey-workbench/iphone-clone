import { apiHandler } from '$lib/backend/api';
import { UsersService } from '$lib/backend/services/UsersService';

const usersService = new UsersService();

export function GET() {
	return apiHandler(async () => {
		const users = await usersService.getAllUsers();
		return { users };
	});
}
