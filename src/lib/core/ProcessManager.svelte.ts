import { appsRegistry } from '$lib/apps/registry';
import { systemGlobalState } from '$lib/core/states/systemGlobalState.svelte';

export interface RunningProcess {
    appId: string;
    component: any;
    zIndex: number;
    minimized: boolean;
}

export class ProcessManager {
    runningApps = $state<RunningProcess[]>([]);
    activeAppId = $state<string | null>(null);
    topZIndex = $state(100);

    launch(appId: string) {
        if (!appsRegistry[appId]) {
            console.error(`App ${appId} not found in registry`);
            return;
        }

        const existingProcess = this.runningApps.find(p => p.appId === appId);
        
        this.topZIndex += 1;
        
        if (existingProcess) {
            // Bring to front
            existingProcess.minimized = false;
            existingProcess.zIndex = this.topZIndex;
        } else {
            // Start new process
            this.runningApps.push({
                appId,
                component: appsRegistry[appId],
                zIndex: this.topZIndex,
                minimized: false
            });
        }
        
        this.activeAppId = appId;
        systemGlobalState.addRecentApp(appId);
    }

    minimize(appId: string) {
        const process = this.runningApps.find(p => p.appId === appId);
        if (process) {
            process.minimized = true;
        }
        if (this.activeAppId === appId) {
            this.activeAppId = null;
        }
    }

    kill(appId: string) {
        this.runningApps = this.runningApps.filter(p => p.appId !== appId);
        systemGlobalState.removeRecentApp(appId);
        if (this.activeAppId === appId) {
            this.activeAppId = null;
        }
    }
    
    killAll() {
        this.runningApps = [];
        this.activeAppId = null;
    }
}

export const processManager = new ProcessManager();
