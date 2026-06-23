import { apiWrapper, ApiError } from '$lib/backend/api';
import { ProxyService } from '$lib/backend/services/ProxyService';
import { RateLimiter } from '$lib/backend/security/RateLimiter';

const proxyService = new ProxyService();
const proxyRateLimiter = new RateLimiter(60 * 1000, 30, 5 * 60 * 1000); // 30 requests per minute

function isLocalOrPrivateIP(hostname: string): boolean {
	const privatePattern =
		/^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.169\.254|\[::1\])$/i;
	return privatePattern.test(hostname);
}

export const GET = apiWrapper(
	async ({ url }) => {
		const targetUrlStr = url.searchParams.get('url');

		if (!targetUrlStr) {
			throw new ApiError(400, 'Missing target URL');
		}

		let targetUrl: URL;
		try {
			targetUrl = new URL(targetUrlStr);
		} catch {
			throw new ApiError(400, 'Invalid URL format');
		}

		if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
			throw new ApiError(400, 'Only HTTP and HTTPS protocols are allowed');
		}

		if (isLocalOrPrivateIP(targetUrl.hostname)) {
			throw new ApiError(403, 'Access to local or private networks is forbidden');
		}

		try {
			const { body, status, headers } = await proxyService.fetchProxy(targetUrlStr);
			return new Response(body, { status, headers });
		} catch (err: any) {
			console.error('[Proxy Error]', err.message || err);
			throw new ApiError(500, 'Internal Proxy Error');
		}
	},
	{ requireAuth: false, customRateLimiter: proxyRateLimiter }
);
