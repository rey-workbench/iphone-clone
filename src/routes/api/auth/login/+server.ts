import { apiWrapper } from '$lib/backend/api';
import { AuthService } from '$lib/backend/services/AuthService';
import { RateLimiter } from '$lib/backend/security/RateLimiter';
import { LoginSchema } from '$lib/backend/validation/Validation';

const authService = new AuthService();
const loginRateLimiter = new RateLimiter(60 * 1000, 5, 5 * 60 * 1000); // 5 attempts per minute

export const POST = apiWrapper(
	async ({ request }) => {
		const rawBody = await request.json();
		const body = LoginSchema.parse(rawBody);

		const userAgent = request.headers.get('user-agent');

		return await authService.login(body, userAgent);
	},
	{ requireAuth: false, customRateLimiter: loginRateLimiter }
);
