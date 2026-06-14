import type { INetflixMedia } from '$lib/types';
import { ApiConfig } from '$lib/config/api';

export class NetflixApiClient {
    static async getTrending() {
        const res = await fetch(ApiConfig.NETFLIX_LATEST);
        return { res, result: res.ok ? await res.json() : null };
    }

    static async search(query: string) {
        const res = await fetch(`${ApiConfig.NETFLIX_SEARCH}?q=${encodeURIComponent(query)}`);
        return { res, result: res.ok ? await res.json() : null };
    }

    static async getDetails(id: number, type: string) {
        const res = await fetch(`${ApiConfig.NETFLIX_DETAILS}?id=${id}&type=${type}`);
        return { res, result: await res.json() };
    }

    static getMovieStreamUrl(tmdbId: string | number, server: number = 1): string {
        if (server === 3) return `${ApiConfig.MULTIEMBED}/?video_id=${tmdbId}&tmdb=1`;
        if (server === 2) return `${ApiConfig.VIDLINK}/movie/${tmdbId}`;
        return `${ApiConfig.VIDSRC_EMBED}/embed/movie?tmdb=${tmdbId}&ds_lang=id`;
    }

    static getTvStreamUrl(tmdbId: string | number, season: number, episode: number, server: number = 1): string {
        if (server === 3) return `${ApiConfig.MULTIEMBED}/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`;
        if (server === 2) return `${ApiConfig.VIDLINK}/tv/${tmdbId}/${season}/${episode}`;
        return `${ApiConfig.VIDSRC_EMBED}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&ds_lang=id`;
    }
}
