import { userDb, UserDBKey } from '$lib/framework/db';
import { SyncState } from '$lib/os/state/SyncState.svelte';
import { UsersApiClient } from '$lib/framework/api/services/UsersApiClient';
import type { IUsersGlobalState } from '$lib/framework/types';
import type { IUser } from '$lib/framework/types';

class UsersGlobalState extends SyncState<IUser[]> implements IUsersGlobalState {
	appName = 'Users';
	// --- Internal State ---
	private updateCallback?: (users: IUser[]) => void;

	constructor() {
		super(userDb, UserDBKey.USERS_LIST, [], async () => {
			return await UsersApiClient.fetchUsers();
		});
	}

	async fetchUsers(onUpdate?: (users: IUser[]) => void) {
		if (onUpdate && this.isLoaded && this.data) {
			onUpdate(this.data);
		}
		if (onUpdate) {
			this.updateCallback = onUpdate;
		}
		await this.load();
	}

	// Override the setter logic to trigger callback if defined
	protected parseCache(cached: any): IUser[] {
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

export const usersGlobalState = new UsersGlobalState();
