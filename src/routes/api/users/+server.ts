import { apiHandler } from '$lib/server/api';
import { UsersService } from '$lib/server/services/UsersService';

const usersService = new UsersService();

export function GET() {
    return apiHandler(async () => {
        const users = await usersService.getAllUsers();
        return { users };
    });
}
