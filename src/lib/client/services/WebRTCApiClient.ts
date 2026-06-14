import { ApiConfig } from '$lib/config/api';

export class WebRTCApiClient {
    static async getTurnCredentials(): Promise<RTCConfiguration> {
        try {
            const response = await fetch(ApiConfig.TURN);
            
            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`);
            }

            const data = await response.json();
            return { iceServers: data.iceServers };
        } catch {
            // Fallback ICE server if the backend is down or not configured
            return {
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            };
        }
    }
}
