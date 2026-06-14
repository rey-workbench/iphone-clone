import { processManager } from './ProcessManager.svelte';
import { intentManager } from './IntentManager';
import { fs } from './FileSystem';
import { systemGlobalState } from '$lib/core/states/systemGlobalState.svelte';

// Central OS Kernel API to be injected into apps
export class OS {
	process = processManager;
	intents = intentManager;
	fs = fs;
	system = systemGlobalState;

	// Future hardware APIs (Camera, Location, Battery) can be mapped here
}

export const os = new OS();
