import { ApiConfig } from '$lib/config/api';
import { userDb, UserDBKey } from '$lib/config/localdb';
import { SyncState } from '$lib/utils/SyncState.svelte';

class UsersState extends SyncState<any[]> {
    private updateCallback?: (users: any[]) => void;

    constructor() {
        super(userDb, UserDBKey.USERS_LIST, [], async () => {
            const res = await fetch(ApiConfig.USERS);
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            return data.users || [];
        });
    }

    async fetchUsers(onUpdate?: (users: any[]) => void) {
        if (onUpdate && this.isLoaded && this.data) {
            onUpdate(this.data);
        }
        if (onUpdate) {
            this.updateCallback = onUpdate;
        }
        await this.load();
    }

    // Override the setter logic to trigger callback if defined
    protected parseCache(cached: any): any[] {
        if (cached && this.updateCallback) {
            this.updateCallback(cached);
        }
        return cached || [];
    }

    // Expose data as users for backward compatibility
    get users() {
        return this.data || [];
    }
}

export const usersState = new UsersState();
