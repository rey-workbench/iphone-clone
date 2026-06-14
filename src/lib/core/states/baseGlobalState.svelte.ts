import { intentManager } from '$lib/core/IntentManager';
import type { IAppLifecycle } from '$lib/types';

export abstract class BaseGlobalState implements IAppLifecycle {
	abstract appName: string;

	// --- Global Reactive Properties ---
	isForeground = $state(false);
	isLoading = $state(false);
	isInitializing = $state(true);
	errorMsg = $state('');

	private unsubs: (() => void)[] = [];
	private _isDestroyed = false;

	constructor() {
		// Register OS lifecycle listeners when state is instantiated.
		// We use setTimeout so abstract properties like appName are initialized
		setTimeout(() => {
			if (this._isDestroyed) return;

			this.unsubs.push(
				intentManager.subscribe(`OS_APP_LAUNCHED_${this.appName}`, async () => {
					this.isForeground = true;
					await this.onLaunch();
				})
			);
			this.unsubs.push(
				intentManager.subscribe(`OS_APP_SUSPENDED_${this.appName}`, async () => {
					this.isForeground = false;
					await this.onSuspend();
				})
			);
			this.unsubs.push(
				intentManager.subscribe(`OS_APP_KILLED_${this.appName}`, async () => {
					this.isForeground = false;
					await this.onDestroy();
				})
			);
		}, 0);
	}

	// --- Intent Utilities ---
	sendIntent(action: string, payload?: any): Promise<any> {
		return intentManager.send(action, payload);
	}

	subscribeIntent(action: string, handler: (payload: any) => void) {
		const unsub = intentManager.subscribe(action, handler);
		this.unsubs.push(unsub);
		return unsub;
	}

	// --- Global Methods ---
	setLoading(status: boolean) {
		this.isLoading = status;
	}

	setError(msg: string) {
		this.errorMsg = msg;
	}

	clearError() {
		this.errorMsg = '';
	}

	// A hook for subclasses to override (legacy)
	async init(): Promise<void> {
		// default does nothing
	}

	// --- Default IAppLifecycle ---
	async onLaunch(): Promise<void> {}
	async onSuspend(): Promise<void> {}
	async onResume(): Promise<void> {}
	async onDestroy(): Promise<void> {
		this._isDestroyed = true;
		for (const unsub of this.unsubs) {
			unsub();
		}
		this.unsubs = [];
	}
}
