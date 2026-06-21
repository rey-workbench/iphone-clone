import { apiHandler, ApiError } from '$lib/backend/api';
import { AuthService } from '$lib/backend/services/AuthService';
import { LoginSchema } from '$lib/backend/validation/Validation';

import { RateLimiter } from '$lib/backend/security/RateLimiter';

const authService = new AuthService();

// Basic In-Memory Rate Limiter (Max 5 attempts per IP per minute)
const loginRateLimiter = new RateLimiter(60 * 1000, 5);

export function POST({ request, getClientAddress }) {
	return apiHandler(async () => {
		// 1. Rate Limiting Check
		const ip = getClientAddress();
		const limit = loginRateLimiter.checkLimit(ip);
		
		if (!limit.allowed) {
			const retrySeconds = Math.ceil(limit.retryAfterMs / 1000);
			throw new ApiError(429, `Too many login attempts. Please try again in ${retrySeconds} seconds.`);
		}

		// 2. Input Validation
		const rawBody = await request.json();
		const body = LoginSchema.parse(rawBody);

		const userAgent = request.headers.get('user-agent');

		// 3. Process Login
		return await authService.login(body, userAgent);
	});
}
