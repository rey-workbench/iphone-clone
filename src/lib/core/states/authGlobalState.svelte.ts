import { systemGlobalState } from '$lib/core/states/systemGlobalState.svelte';
import { AuthApiClient } from '$lib/client/services/AuthApiClient';
import type { IAuthGlobalState } from '$lib/types';
import { BaseGlobalState } from './baseGlobalState.svelte';

class AuthGlobalState extends BaseGlobalState implements IAuthGlobalState {
	appName = 'Auth';
	// --- State ---
	username = $state('');
	password = $state('');

	// --- Methods ---
	async login(): Promise<any> {
		if (!this.username || !this.password) {
			this.setError('Please enter both username and password.');
			return null;
		}

		this.setLoading(true);
		this.clearError();

		try {
			const data = await AuthApiClient.login(
				this.username,
				this.password,
				systemGlobalState.deviceId,
				systemGlobalState.deviceName
			);

			if (data.success && data.user) {
				return data.user;
			} else {
				this.setError(data.error || 'Incorrect Apple ID or password.');
				return null;
			}
		} catch {
			this.setError('Failed to connect to server.');
			return null;
		} finally {
			this.setLoading(false);
		}
	}

	async logout() {
		if (!systemGlobalState.currentUser) return;

		try {
			await AuthApiClient.logout(systemGlobalState.currentUser.id, systemGlobalState.deviceId);
		} catch {
			// console.error('Failed to revoke device session on logout', e);
		}

		systemGlobalState.currentUser = null;
		systemGlobalState.saveUser();
		window.location.reload();
	}
}

export const authGlobalState = new AuthGlobalState();
