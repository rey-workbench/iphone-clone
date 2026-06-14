import { env } from '$env/dynamic/private';
import { ApiConfig } from '$lib/config/api';

export class NetflixService {
    private get tmdbToken() {
        return env.TMDB_ACCESS_TOKEN;
    }

    private get tmdbOptions() {
        return {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${this.tmdbToken}`
            }
        };
    }

    private formatItem(item: any, type?: string) {
        return {
            id: item.id,
            title: item.title || item.name,
            overview: item.overview,
            poster_path: item.poster_path ? `${ApiConfig.TMDB_IMAGE_BASE}/w500${item.poster_path}` : null,
            backdrop_path: item.backdrop_path ? `${ApiConfig.TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : null,
            vote_average: item.vote_average,
            media_type: type || item.media_type
        };
    }

    async getDetails(id: string, type: string) {
        if (!this.tmdbToken) throw new Error("TMDB_ACCESS_TOKEN is missing");
        
        const res = await fetch(`${ApiConfig.TMDB_API_BASE}/${type}/${id}?append_to_response=credits,videos`, this.tmdbOptions);
        const data = await res.json();
        
        if (data.success === false) {
             throw new Error(data.status_message);
        }

        const cast = data.credits?.cast?.slice(0, 3).map((c: any) => c.name).join(", ") || "Unknown";
        
        let creator = "Unknown";
        if (type === 'tv') {
            creator = data.created_by?.map((c: any) => c.name).join(", ") || "Unknown";
        } else {
            const director = data.credits?.crew?.find((c: any) => c.job === 'Director');
            if (director) creator = director.name;
        }

        let trailerId = null;
        if (data.videos?.results) {
            const trailer = data.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
            if (trailer) {
                trailerId = trailer.key;
            } else if (data.videos.results.length > 0) {
                trailerId = data.videos.results[0].key;
            }
        }

        const imdbId = data.imdb_id || null;
        
        let seasons = [];
        if (type === 'tv' && data.seasons) {
            seasons = data.seasons
                .filter((s: any) => s.season_number > 0)
                .map((s: any) => ({
                    season_number: s.season_number,
                    episode_count: s.episode_count,
                    name: s.name || `Season ${s.season_number}`
                }));
        }

        return { cast, creator, trailerId, imdb_id: imdbId, seasons };
    }

    async getLatest() {
        if (!this.tmdbToken) throw new Error("TMDB_ACCESS_TOKEN is missing");

        const moviesRes = await fetch(`${ApiConfig.VIDSRC_EMBED}/movies/latest/page-1.json`);
        const moviesData = await moviesRes.json();
        const latestMovies = moviesData.result?.slice(0, 15) || [];

        const tvRes = await fetch(`${ApiConfig.VIDSRC_EMBED}/tvshows/latest/page-1.json`);
        const tvData = await tvRes.json();
        const latestTvShows = tvData.result?.slice(0, 15) || [];

        const fetchTmdbDetails = async (item: any, type: 'movie' | 'tv') => {
            if (!item.tmdb_id) return null;
            try {
                const res = await fetch(`${ApiConfig.TMDB_API_BASE}/${type}/${item.tmdb_id}?language=en-US`, this.tmdbOptions);
                const data = await res.json();
                if (data.id) {
                    return this.formatItem(data, type);
                }
            } catch {
                // console.error(`Error fetching TMDB details for ${type} ${item.tmdb_id}`, e);
            }
            return null;
        };

        const moviesPromises = latestMovies.map((m: any) => fetchTmdbDetails(m, 'movie'));
        const tvPromises = latestTvShows.map((t: any) => fetchTmdbDetails(t, 'tv'));

        const enrichedMovies = (await Promise.all(moviesPromises)).filter(Boolean);
        const enrichedTv = (await Promise.all(tvPromises)).filter(Boolean);

        return { movies: enrichedMovies, tv: enrichedTv };
    }

    async search(query: string) {
        if (!this.tmdbToken) throw new Error("TMDB_ACCESS_TOKEN is missing");
        if (!query) return { results: [] };

        const res = await fetch(`${ApiConfig.TMDB_API_BASE}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, this.tmdbOptions);
        const data = await res.json();

        const results = data.results
            ?.filter((m: any) => m.media_type === 'movie' || m.media_type === 'tv')
            ?.map((m: any) => this.formatItem(m)) || [];

        return { results };
    }

    async getTrending() {
        if (!this.tmdbToken) throw new Error("TMDB_ACCESS_TOKEN is missing");

        const moviesRes = await fetch(`${ApiConfig.TMDB_API_BASE}/trending/movie/day?language=en-US`, this.tmdbOptions);
        const moviesData = await moviesRes.json();

        const tvRes = await fetch(`${ApiConfig.TMDB_API_BASE}/trending/tv/day?language=en-US`, this.tmdbOptions);
        const tvData = await tvRes.json();

        const movies = moviesData.results?.map((m: any) => this.formatItem(m, 'movie')) || [];
        const tv = tvData.results?.map((t: any) => this.formatItem(t, 'tv')) || [];

        return { movies, tv };
    }
}
