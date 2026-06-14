import { json } from '@sveltejs/kit';
import { NetflixService } from '$lib/server/services/NetflixService';

const netflixService = new NetflixService();

export async function GET({ url }) {
	const query = url.searchParams.get('q');

	if (!query) {
		return json({ results: [] });
	}

	try {
		const data = await netflixService.search(query);
		return json(data);
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
}
