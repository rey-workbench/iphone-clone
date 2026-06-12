// Api requests
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
        const providers = ApiEndpoints.WEATHER_IP_PROVIDERS;

        for (const url of providers) {
            try {
                // Refresh cache every 10 seconds (10000 ms)
                const data = await fetchWithCache(url, undefined, 10000);
                if (!data || data.error || data.success === false || data.status === 'fail') continue;

                let lat = data.latitude !== undefined ? data.latitude : data.lat;
                let lon = data.longitude !== undefined ? data.longitude : data.lon;
                let city = data.city || data.cityName;

                if (typeof lat === 'string') lat = parseFloat(lat);
                if (typeof lon === 'string') lon = parseFloat(lon);

                if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
                    return { latitude: lat, longitude: lon, city: city || 'Unknown' };
                }
            } catch (e) {
                // console.warn(`[ApiConfig] Failed to fetch IP from ${url}`);
            }
        }
        throw new Error("All IP geolocation providers failed");
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
            const response = await fetch('/api/turn');
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            const data = await response.json();
            return { iceServers: data.iceServers };
        } catch (error) {
            // console.error("[ApiConfig] Failed to fetch ICE servers, using fallback", error);
            return {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            };
        }
    }
};
