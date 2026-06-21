import { apiHandler, ApiError } from '$lib/backend/api';
import { UsersService } from '$lib/backend/services/UsersService';
import { isAuthorized } from '$lib/backend/security/AuthValidator';

const usersService = new UsersService();

export function GET({ request }) {
	return apiHandler(async () => {
        if (!(await isAuthorized(request, null))) {
            throw new ApiError(403, 'Unauthorized access to users directory');
        }

		const users = await usersService.getAllUsers();
		return { users };
	});
}
