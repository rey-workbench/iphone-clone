import { json } from '@sveltejs/kit';
import { SafariSearchService } from '$lib/server/services/SafariSearchService';

const safariSearchService = new SafariSearchService();

export async function GET({ url }) {
	const query = url.searchParams.get('q');

	try {
		const data = await safariSearchService.search(query || '');
		return json(data);
	} catch (error: any) {
		// console.error('[SafariSearch API Error]', error);
		const status = error.message.includes('required') ? 400 : 500;
		return json({ error: error.message || 'Internal Server Error' }, { status });
	}
}
