import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function GET({ url }) {
    const tmdbToken = env.TMDB_ACCESS_TOKEN;
    const query = url.searchParams.get('q');
    
    if (!tmdbToken) {
        return json({ error: "TMDB_ACCESS_TOKEN is missing" }, { status: 500 });
    }

    if (!query) {
        return json({ results: [] });
    }

    try {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${tmdbToken}`
            }
        };

        // Fetch multi search
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, options);
        const data = await res.json();

        // Helper to format full image URLs
        const formatItem = (item: any) => ({
            id: item.id,
            title: item.title || item.name,
            overview: item.overview,
            poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
            vote_average: item.vote_average,
            media_type: item.media_type
        });

        // Filter out people, we only want movie and tv
        const results = data.results
            ?.filter((m: any) => m.media_type === 'movie' || m.media_type === 'tv')
            ?.map((m: any) => formatItem(m)) || [];

        return json({ results });
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}
