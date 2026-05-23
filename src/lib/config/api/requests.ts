import { PUBLIC_METERED_TURN_API_KEY } from '$env/static/public';
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
            if (!PUBLIC_METERED_TURN_API_KEY) {
                throw new Error("Missing PUBLIC_METERED_TURN_API_KEY in environment variables");
            }
            
            const response = await fetch(`${ApiEndpoints.TURN_CREDENTIALS}?apiKey=${PUBLIC_METERED_TURN_API_KEY}`);
            
            if (!response.ok) {
                throw new Error(`Metered API responded with status: ${response.status}`);
            }

            const iceServers = await response.json();
            return { iceServers };
        } catch (error) {
            console.error("[ApiConfig] Failed to fetch ICE servers from Metered, using fallback", error);
            return {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            };
        }
    }
};
