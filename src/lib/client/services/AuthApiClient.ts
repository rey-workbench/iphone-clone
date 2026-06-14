import type { IUser } from '$lib/types';
import { ApiConfig } from '$lib/config/api';

export class AuthApiClient {
    static async login(username: string, password: string, deviceId: string, deviceName: string): Promise<{ success: boolean; user?: IUser; error?: string }> {
        const res = await fetch(ApiConfig.AUTH_LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, deviceId, deviceName })
        });
        return await res.json();
    }

    static async logout(userId: string, deviceId: string): Promise<Response> {
        return await fetch(ApiConfig.AUTH_DEVICES, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, deviceId })
        });
    }
}
