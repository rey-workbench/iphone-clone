import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function GET({ url }) {
    const tmdbToken = env.TMDB_ACCESS_TOKEN;
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type') || 'movie';
    
    if (!tmdbToken) {
        return json({ error: "TMDB_ACCESS_TOKEN is missing" }, { status: 500 });
    }
    
    if (!id) {
        return json({ error: "Missing id parameter" }, { status: 400 });
    }

    try {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${tmdbToken}`
            }
        };

        const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?append_to_response=credits,videos`, options);
        const data = await res.json();
        
        if (data.success === false) {
             return json({ error: data.status_message }, { status: 404 });
        }

        // Extract Cast (top 3 actors)
        const cast = data.credits?.cast?.slice(0, 3).map((c: any) => c.name).join(", ") || "Unknown";
        
        // Extract Director/Creator
        let creator = "Unknown";
        if (type === 'tv') {
            creator = data.created_by?.map((c: any) => c.name).join(", ") || "Unknown";
        } else {
            const director = data.credits?.crew?.find((c: any) => c.job === 'Director');
            if (director) creator = director.name;
        }

        // Extract Trailer Video
        let trailerId = null;
        if (data.videos?.results) {
            const trailer = data.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
            if (trailer) {
                trailerId = trailer.key;
            } else if (data.videos.results.length > 0) {
                trailerId = data.videos.results[0].key; // fallback to any video
            }
        }

        return json({ cast, creator, trailerId });
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}
