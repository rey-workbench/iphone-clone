import { json } from '@sveltejs/kit';
import { NetflixService } from '$lib/server/services/NetflixService';

const netflixService = new NetflixService();

export async function GET() {
	try {
		const data = await netflixService.getTrending();
		return json(data);
	} catch (error: any) {
		return json({ error: error.message }, { status: 500 });
	}
}
