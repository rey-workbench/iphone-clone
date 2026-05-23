import type { IMusicSearchOptions } from '../types/music';

export class ApiConfig {
    // External APIs
    static readonly WEATHER_IP = 'https://ipapi.co/json/';
    static readonly AUTH_LOGIN = '/api/auth/login';
    static readonly SYSTEM_KEEPALIVE = '/api/keepalive';
    static readonly NOTES = '/api/notes';
    static readonly CHAT = '/api/chat';
    static readonly LLM_CHAT_COMPLETION = 'https://api.llm7.io/v1/chat/completions';

    static getWeatherForecast(lat: number, lon: number): string {
        return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,surface_pressure,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
    }

    static getPhotosList(page: number = 1, limit: number = 30): string {
        return `https://picsum.photos/v2/list?page=${page}&limit=${limit}`;
    }

    static getAppStoreProducts(limit: number = 11, skip: number = 10): string {
        return `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
    }

    static getMailComments(limit: number = 15): string {
        return `https://jsonplaceholder.typicode.com/comments?_limit=${limit}`;
    }

    static getMusicSearch(options: IMusicSearchOptions): string {
        const params = new URLSearchParams();
        if (options.action) params.append('action', options.action);
        if (options.q) params.append('q', options.q);
        if (options.type) params.append('type', options.type);
        if (options.title) params.append('title', options.title);
        if (options.artist) params.append('artist', options.artist);
        if (options.duration !== undefined) params.append('duration', String(options.duration));
        
        const queryString = params.toString();
        return `/api/ytsearch${queryString ? '?' + queryString : ''}`;
    }
}
