import { ApiConfig } from '$lib/config/api';

export class AuthApiClient {
    static async login(username: string, password: string, deviceId: string, deviceName: string) {
        const res = await fetch(ApiConfig.AUTH_LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, deviceId, deviceName })
        });
        return await res.json();
    }

    static async logout(userId: string, deviceId: string) {
        return await fetch(ApiConfig.AUTH_DEVICES, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, deviceId })
        });
    }
}
