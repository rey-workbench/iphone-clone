import type { IUser } from '$lib/framework/types';
import { ApiConfig, getAuthHeaders } from '$lib/framework/api/api';

export class UsersApiClient {
	static async fetchUsers(): Promise<IUser[]> {
		const res = await fetch(ApiConfig.USERS, {
			headers: getAuthHeaders()
		});
		if (!res.ok) throw new Error('Failed to fetch users');
		const data = await res.json();
		return data.users || [];
	}
}
