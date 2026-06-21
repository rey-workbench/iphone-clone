import { SystemApiClient } from '$lib/framework/api/services/SystemApiClient';
import { sessionDb, SessionDBKey } from '$lib/framework/db';
import type { ISystemGlobalState, ISystemCurrentUser } from '$lib/framework/types';
import { BaseGlobalState } from './baseGlobalState.svelte';

class SystemGlobalState extends BaseGlobalState implements ISystemGlobalState {
	appName = 'System';
	// --- State ---
	recentApps = $state<string[]>([]);
	currentUser = $state<ISystemCurrentUser | null>(null);
	currentTime = $state<Date>(new Date());
	deviceId = $state<string>('');
	deviceName = $state<string>('Unknown Device');

	// --- Methods ---
	removeRecentApp(appId: string) {
		this.recentApps = this.recentApps.filter((id) => id !== appId);
		this.saveRecentApps();
	}

	addRecentApp(appId: string) {
		this.recentApps = this.recentApps.filter((id) => id !== appId);
		this.recentApps.unshift(appId);
		if (this.recentApps.length > 10) {
			this.recentApps.pop();
		}
		this.saveRecentApps();
	}

	async saveRecentApps() {
		if (typeof window !== 'undefined') {
			await sessionDb.set('RECENT_APPS', $state.snapshot(this.recentApps));
		}
	}

	constructor() {
		super();
		if (typeof window !== 'undefined') {
			this.init();

			// Time updater
			setInterval(() => {
				this.currentTime = new Date();
			}, 1000);

			// Keepalive ping
			SystemApiClient.sendKeepalivePing();
			setInterval(
				() => {
					SystemApiClient.sendKeepalivePing();
				},
				30 * 60 * 1000
			);
		}
	}

	async init() {
		try {
			this.currentUser = (await sessionDb.get(SessionDBKey.CURRENT_USER, null)) as {
				id: string;
				username: string;
				name: string;
			} | null;
			this.recentApps = (await sessionDb.get('RECENT_APPS', [])) as string[];

			let devId = (await sessionDb.get('device_id', null)) as string | null;
			if (!devId) {
				devId = crypto.randomUUID();
				await sessionDb.set('device_id', devId);
			}
			this.deviceId = devId;
		} finally {
			this.isInitializing = false;
		}
	}

	async saveUser() {
		if (typeof window !== 'undefined') {
			if (this.currentUser) {
				const snap = $state.snapshot(this.currentUser);
				await sessionDb.set(SessionDBKey.CURRENT_USER, snap);
			} else {
				await sessionDb.set(SessionDBKey.CURRENT_USER, undefined);
			}
		}
	}
}

export const systemGlobalState = new SystemGlobalState();
