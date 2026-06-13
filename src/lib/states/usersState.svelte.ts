import { userDb, UserDBKey } from '$lib/config/localdb';
import { SyncState } from '$lib/utils/SyncState.svelte';
import { UsersApiClient } from '$lib/client/services/UsersApiClient';

class UsersState extends SyncState<any[]> {
    private updateCallback?: (users: any[]) => void;

    constructor() {
        super(userDb, UserDBKey.USERS_LIST, [], async () => {
            return await UsersApiClient.fetchUsers();
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
