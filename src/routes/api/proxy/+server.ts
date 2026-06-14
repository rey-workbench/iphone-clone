import { error } from '@sveltejs/kit';
import { ProxyService } from '$lib/backend/services/ProxyService';

const proxyService = new ProxyService();

export async function GET({ url }) {
	const targetUrl = url.searchParams.get('url');

	try {
		const { body, status, headers } = await proxyService.fetchProxy(targetUrl || '');
		return new Response(body, { status, headers });
	} catch (err: any) {
		if (err.message.includes('Missing')) {
			throw error(400, err.message);
		}
		throw error(500, `Proxy failed: ${err.message}`);
	}
}
