import { appsRegistry } from '$lib/apps/registry';
import { systemGlobalState } from '$lib/os/state/systemGlobalState.svelte';

export interface RunningProcess {
	appId: string;
	component: any;
	zIndex: number;
	minimized: boolean;
	isSuspended: boolean;
	lastAccessed: number;
}

export class ProcessManager {
	runningApps = $state<RunningProcess[]>([]);
	activeAppId = $state<string | null>(null);
	topZIndex = $state(100);

	// Limit active DOM apps to save memory (Simulating RAM limits)
	private maxActiveApps = 3;

	launch(appId: string) {
		if (!appsRegistry[appId]) {
			console.error(`App ${appId} not found in registry`);
			return;
		}

		const existingProcess = this.runningApps.find((p) => p.appId === appId);

		this.topZIndex += 1;
		const now = Date.now();

		if (existingProcess) {
			// Bring to front and resume if suspended
			existingProcess.minimized = false;
			existingProcess.isSuspended = false;
			existingProcess.zIndex = this.topZIndex;
			existingProcess.lastAccessed = now;
		} else {
			// Start new process
			this.runningApps.push({
				appId,
				component: appsRegistry[appId],
				zIndex: this.topZIndex,
				minimized: false,
				isSuspended: false,
				lastAccessed: now
			});
		}

		this.activeAppId = appId;
		systemGlobalState.addRecentApp(appId);

		this.optimizeMemory();
	}

	minimize(appId: string) {
		const process = this.runningApps.find((p) => p.appId === appId);
		if (process) {
			process.minimized = true;
			process.lastAccessed = Date.now();
		}
		if (this.activeAppId === appId) {
			this.activeAppId = null;
		}
	}

	kill(appId: string) {
		this.runningApps = this.runningApps.filter((p) => p.appId !== appId);
		systemGlobalState.removeRecentApp(appId);
		if (this.activeAppId === appId) {
			this.activeAppId = null;
		}
	}

	killAll() {
		this.runningApps = [];
		this.activeAppId = null;
	}

	// Garbage Collection / Suspend Logic
	private optimizeMemory() {
		// Find all non-suspended, minimized apps
		const backgroundApps = this.runningApps.filter(
			(p) => p.minimized && !p.isSuspended && p.appId !== this.activeAppId
		);

		const activeCount = this.runningApps.filter((p) => !p.isSuspended).length;

		if (activeCount > this.maxActiveApps) {
			// Suspend the oldest accessed background apps to meet the limit
			const appsToSuspend = activeCount - this.maxActiveApps;
			backgroundApps.sort((a, b) => a.lastAccessed - b.lastAccessed); // Oldest first

			for (let i = 0; i < appsToSuspend && i < backgroundApps.length; i++) {
				backgroundApps[i].isSuspended = true;
				// Note: The global state for the app is STILL loaded in memory!
				// Only the DOM component (isSuspended = true) will be unmounted by AppRenderer.
			}
		}
	}
}

export const processManager = new ProcessManager();
