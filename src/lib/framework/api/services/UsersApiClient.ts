import type { IUser } from '$lib/framework/types';
import { ApiConfig, apiFetch } from '$lib/framework/api/api';

export class UsersApiClient {
	static async fetchUsers(): Promise<IUser[]> {
		const res = await apiFetch(ApiConfig.USERS);
		if (!res.ok) {
			if (res.status === 401) return [];
			throw new Error('Failed to fetch users');
		}
		const data = await res.json();
		return data.users || [];
	}
}
