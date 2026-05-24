import type { IMusicSearchOptions } from '../../types/music';
import { ApiEndpoints } from './endpoints';

export const ApiDynamic = {
    getWeatherForecast(lat: number, lon: number): string {
        return `${ApiEndpoints.WEATHER_FORECAST}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,surface_pressure,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
    },

    getPhotosList(page: number = 1, limit: number = 30): string {
        return `${ApiEndpoints.PHOTOS_LIST}?page=${page}&limit=${limit}`;
    },

    getAppStoreProducts(limit: number = 11, skip: number = 10): string {
        return `${ApiEndpoints.APP_STORE_PRODUCTS}?limit=${limit}&skip=${skip}`;
    },

    getMailComments(limit: number = 15): string {
        return `${ApiEndpoints.MAIL_COMMENTS}?_limit=${limit}`;
    },

    getMusicSearch(options: IMusicSearchOptions): string {
        const params = new URLSearchParams();
        if (options.action) params.append('action', options.action);
        if (options.q) params.append('q', options.q);
        if (options.type) params.append('type', options.type);
        if (options.title) params.append('title', options.title);
        if (options.artist) params.append('artist', options.artist);
        if (options.duration !== undefined) params.append('duration', String(options.duration));
        
        const queryString = params.toString();
        return `${ApiEndpoints.MUSIC_SEARCH}${queryString ? '?' + queryString : ''}`;
    },

    getNetflixMovieStream(tmdbId: string | number, server: number = 1): string {
        if (server === 2) return `${ApiEndpoints.TWOEMBED}/embed/${tmdbId}`;
        return `${ApiEndpoints.VIDSRC_EMBED}/embed/movie?tmdb=${tmdbId}&ds_lang=id`;
    },

    getNetflixTvStream(tmdbId: string | number, season: number, episode: number, server: number = 1): string {
        if (server === 2) return `${ApiEndpoints.TWOEMBED}/embedtv/${tmdbId}&s=${season}&e=${episode}`;
        return `${ApiEndpoints.VIDSRC_EMBED}/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}&ds_lang=id`;
    }
};
