import { apiHandler } from '$lib/backend/api';
import { AuthService } from '$lib/backend/services/AuthService';

const authService = new AuthService();

export function POST({ request }) {
	return apiHandler(async () => {
		const body = await request.json();
		const userAgent = request.headers.get('user-agent');

		return await authService.login(body, userAgent);
	});
}
