import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function GET() {
    const tmdbToken = env.TMDB_ACCESS_TOKEN;
    
    if (!tmdbToken) {
        return json({ error: "TMDB_ACCESS_TOKEN is missing" }, { status: 500 });
    }

    try {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${tmdbToken}`
            }
        };

        // Fetch Trending Movies
        const moviesRes = await fetch('https://api.themoviedb.org/3/trending/movie/day?language=en-US', options);
        const moviesData = await moviesRes.json();

        // Fetch Trending TV Shows
        const tvRes = await fetch('https://api.themoviedb.org/3/trending/tv/day?language=en-US', options);
        const tvData = await tvRes.json();

        // Helper to format full image URLs
        const formatItem = (item: any, type: string) => ({
            id: item.id,
            title: item.title || item.name,
            overview: item.overview,
            poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : null,
            vote_average: item.vote_average,
            media_type: type
        });

        const movies = moviesData.results?.map((m: any) => formatItem(m, 'movie')) || [];
        const tv = tvData.results?.map((t: any) => formatItem(t, 'tv')) || [];

        return json({ movies, tv });
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}
