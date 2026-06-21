import { json, type RequestEvent } from '@sveltejs/kit';
import { isAuthorized } from '$lib/backend/security/AuthValidator';
import { RateLimiter } from '$lib/backend/security/RateLimiter';

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

// Global default rate limiter: 30 requests per minute
const globalRateLimiter = new RateLimiter(60 * 1000, 30, 5 * 60 * 1000);

export interface ApiHandlerOptions {
	requireAuth?: boolean; // Default: true
	rateLimit?: boolean; // Default: true
	customRateLimiter?: RateLimiter;
}

/**
 * A higher-order function that wraps API handlers to automatically enforce rate limits and authorization.
 */
export function apiWrapper(
	handler: (event: RequestEvent) => Promise<unknown> | unknown,
	options: ApiHandlerOptions = {}
) {
	const { requireAuth = true, rateLimit = true, customRateLimiter } = options;

	return async (event: RequestEvent) => {
		try {
			// 1. Rate Limiting
			if (rateLimit) {
				const limiter = customRateLimiter || globalRateLimiter;
				const ip = event.getClientAddress();
				const limit = limiter.checkLimit(ip);
				if (!limit.allowed) {
					const retrySeconds = Math.ceil(limit.retryAfterMs / 1000);
					throw new ApiError(
						429,
						`Too many requests. Please try again in ${retrySeconds} seconds.`
					);
				}
			}

			// 2. Authorization
			if (requireAuth) {
				if (!(await isAuthorized(event.request, null))) {
					throw new ApiError(403, 'Unauthorized access to API service');
				}
			}

			// 3. Execute Handler
			const result = await handler(event);

			// If handler returns a Response, return it directly
			if (result instanceof Response) return result;

			// Otherwise, wrap in standard success object
			return json({
				success: true,
				...(typeof result === 'object' && result !== null ? result : {})
			});
		} catch (e: unknown) {
			console.error('API Error:', (e as Error).message);
			const status = e instanceof ApiError ? e.status : (e as any).status || 500;
			return json({ success: false, error: (e as Error).message || String(e) }, { status });
		}
	};
}
