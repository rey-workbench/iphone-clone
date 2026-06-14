import type { IUser } from '$lib/types';
import { ApiConfig } from '$lib/config/api';

export class UsersApiClient {
    static async fetchUsers(): Promise<IUser[]> {
        const res = await fetch(ApiConfig.USERS);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        return data.users || [];
    }
}
