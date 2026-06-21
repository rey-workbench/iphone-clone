import { error } from '@sveltejs/kit';
import { ProxyService } from '$lib/backend/services/ProxyService';

const proxyService = new ProxyService();

function isLocalOrPrivateIP(hostname: string): boolean {
	const privatePattern =
		/^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.169\.254|\[::1\])$/i;
	return privatePattern.test(hostname);
}

export async function GET({ url }) {
	const targetUrlStr = url.searchParams.get('url');

	if (!targetUrlStr) {
		throw error(400, 'Missing target URL');
	}

	let targetUrl: URL;
	try {
		targetUrl = new URL(targetUrlStr);
	} catch {
		throw error(400, 'Invalid URL format');
	}

	if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
		throw error(400, 'Only HTTP and HTTPS protocols are allowed');
	}

	if (isLocalOrPrivateIP(targetUrl.hostname)) {
		throw error(403, 'Access to local or private networks is forbidden');
	}

	try {
		const { body, status, headers } = await proxyService.fetchProxy(targetUrlStr);
		return new Response(body, { status, headers });
	} catch (err: any) {
		// Log error internally, do not leak raw error message to client
		console.error('[Proxy Error]', err.message || err);
		throw error(500, 'Internal Proxy Error');
	}
}
