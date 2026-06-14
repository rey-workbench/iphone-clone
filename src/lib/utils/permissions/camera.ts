import { dialogGlobalState } from '$lib/core/states';
import { processManager } from '$lib/core/ProcessManager.svelte';

/**
 * Request camera permission (for future FaceTime or Camera app)
 */
export async function requestCamera(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        try {
            const status = await navigator.permissions.query({ name: 'camera' as PermissionName }).catch(() => null);
            if (status && status.state === 'granted') {
                return true;
            }
        } catch {
            // Ignore query errors
        }
    }

    const activeAppId = processManager.activeAppId || 'App';
    const appName = activeAppId.charAt(0).toUpperCase() + activeAppId.slice(1);

    const allowed = await dialogGlobalState.show({
        title: `"${appName}" Would Like to Access the Camera`,
        message: 'This allows you to take photos and record videos.',
        confirmText: 'OK',
        cancelText: 'Don\'t Allow'
    });

    if (allowed) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch {
            // console.error("Camera access denied by browser system:", err);
            return false;
        }
    }
    return false;
}
