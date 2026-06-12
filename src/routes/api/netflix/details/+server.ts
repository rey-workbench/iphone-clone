import { json } from '@sveltejs/kit';
import { NetflixService } from '$lib/server/services/NetflixService';

const netflixService = new NetflixService();

export async function GET({ url }) {
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type') || 'movie';
    
    if (!id) {
        return json({ error: "Missing id parameter" }, { status: 400 });
    }

    try {
        const details = await netflixService.getDetails(id, type);
        return json(details);
    } catch (error: any) {
        const status = error.message.includes('missing') ? 500 : (error.message.includes('could not be found') ? 404 : 500);
        return json({ error: error.message }, { status });
    }
}
