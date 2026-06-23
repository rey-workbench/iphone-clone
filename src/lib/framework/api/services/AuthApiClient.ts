import type { IUser } from '$lib/framework/types';
import { ApiConfig, apiFetch } from '$lib/framework/api/api';

export class AuthApiClient {
	static async login(
		username: string,
		password: string,
		deviceId: string,
		deviceName: string
	): Promise<{ success: boolean; user?: IUser; error?: string }> {
		const res = await apiFetch(ApiConfig.AUTH_LOGIN, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password, deviceId, deviceName }),
			requireAuth: false
		});
		return await res.json();
	}

	static async logout(userId: string, deviceId: string): Promise<Response> {
		return await apiFetch(ApiConfig.AUTH_DEVICES, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId, deviceId })
		});
	}
}
