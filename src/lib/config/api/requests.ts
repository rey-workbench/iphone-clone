import { PUBLIC_CLOUDFLARE_TURN_KEY_ID, PUBLIC_CLOUDFLARE_TURN_API_TOKEN } from '$env/static/public';
import { ApiEndpoints } from './endpoints';
import { ApiDynamic } from './dynamic';
import { fetchWithCache } from '$lib/utils/fetchWithCache';
import type { IMusicSearchOptions } from '$lib/types/music';

export const ApiRequests = {
    // ==========================================
    // Request Builders (Returns RequestInit)
    // ==========================================
    getRevokeDeviceRequest(userId: string | undefined, deviceId: string | undefined): RequestInit {
        return {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, deviceId })
        };
    },

    getLoginRequest(username: string, password: string, deviceId: string | undefined, deviceName: string | undefined): RequestInit {
        return {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, deviceId, deviceName })
        };
    },

    getNotesRequest(method: 'POST' | 'PUT' | 'DELETE', payload: any): RequestInit {
        return {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };
    },

    getChatRequest(payload: any): RequestInit {
        return {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };
    },

    // ==========================================
    // Async Fetchers (Executes API Calls)
    // ==========================================
    async fetchWeatherIP(): Promise<any> {
        return await fetchWithCache(ApiEndpoints.WEATHER_IP);
    },
    async fetchWeatherForecast(lat: number, lon: number): Promise<any> {
        return await fetchWithCache(ApiDynamic.getWeatherForecast(lat, lon));
    },
    async fetchPhotosList(): Promise<any> {
        return await fetchWithCache(ApiDynamic.getPhotosList());
    },
    async fetchAppStoreProducts(): Promise<any> {
        return await fetchWithCache(ApiDynamic.getAppStoreProducts());
    },
    async fetchMailComments(): Promise<any> {
        return await fetchWithCache(ApiDynamic.getMailComments());
    },
    async fetchMusicSearch(options: IMusicSearchOptions): Promise<any> {
        return await fetchWithCache(ApiDynamic.getMusicSearch(options));
    },

    async fetchTurnCredentials(): Promise<RTCConfiguration> {
        try {
            if (!PUBLIC_CLOUDFLARE_TURN_KEY_ID || !PUBLIC_CLOUDFLARE_TURN_API_TOKEN) {
                throw new Error("Missing Cloudflare TURN environment variables");
            }
            
            const response = await fetch(`${ApiEndpoints.TURN_CREDENTIALS}/${PUBLIC_CLOUDFLARE_TURN_KEY_ID}/credentials/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PUBLIC_CLOUDFLARE_TURN_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ttl: 86400 })
            });
            
            if (!response.ok) {
                throw new Error(`Cloudflare API responded with status: ${response.status}`);
            }

            const data = await response.json();
            return { iceServers: Array.isArray(data.iceServers) ? data.iceServers : [data.iceServers] };
        } catch (error) {
            console.error("[ApiConfig] Failed to fetch ICE servers from Cloudflare, using fallback", error);
            return {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            };
        }
    }
};
