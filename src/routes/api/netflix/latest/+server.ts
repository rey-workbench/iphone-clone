import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { ApiEndpoints } from '$lib/config/api/endpoints';

export async function GET() {
    const tmdbToken = env.TMDB_ACCESS_TOKEN;
    
    if (!tmdbToken) {
        return json({ error: "TMDB_ACCESS_TOKEN is missing" }, { status: 500 });
    }

    try {
        const tmdbOptions = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${tmdbToken}`
            }
        };

        // Fetch Latest Movies from Vidsrc
        const moviesRes = await fetch(`${ApiEndpoints.VIDSRC_EMBED}/movies/latest/page-1.json`);
        const moviesData = await moviesRes.json();
        const latestMovies = moviesData.result?.slice(0, 15) || [];

        // Fetch Latest TV Shows from Vidsrc
        const tvRes = await fetch(`${ApiEndpoints.VIDSRC_EMBED}/tvshows/latest/page-1.json`);
        const tvData = await tvRes.json();
        const latestTvShows = tvData.result?.slice(0, 15) || [];

        // Helper to fetch TMDB details to enrich the vidsrc data with posters and overviews
        const fetchTmdbDetails = async (item: any, type: 'movie' | 'tv') => {
            if (!item.tmdb_id) return null;
            try {
                const res = await fetch(`https://api.themoviedb.org/3/${type}/${item.tmdb_id}?language=en-US`, tmdbOptions);
                const data = await res.json();
                if (data.id) {
                    return {
                        id: data.id,
                        title: data.title || data.name,
                        overview: data.overview,
                        poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
                        backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
                        vote_average: data.vote_average,
                        media_type: type
                    };
                }
            } catch (e) {
                console.error(`Error fetching TMDB details for ${type} ${item.tmdb_id}`, e);
            }
            return null;
        };

        // Fetch all details in parallel
        const moviesPromises = latestMovies.map((m: any) => fetchTmdbDetails(m, 'movie'));
        const tvPromises = latestTvShows.map((t: any) => fetchTmdbDetails(t, 'tv'));

        const enrichedMovies = (await Promise.all(moviesPromises)).filter(Boolean);
        const enrichedTv = (await Promise.all(tvPromises)).filter(Boolean);

        return json({ movies: enrichedMovies, tv: enrichedTv });
    } catch (error: any) {
        return json({ error: error.message }, { status: 500 });
    }
}
