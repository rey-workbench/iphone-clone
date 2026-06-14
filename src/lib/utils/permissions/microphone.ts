import { dialogGlobalState } from '$lib/core/states';
import { processManager } from '$lib/core/ProcessManager.svelte';

/**
 * Request microphone permission from the user
 */
export async function requestMicrophone(): Promise<boolean> {
    // Coba periksa apakah kita sudah punya akses (di browser)
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        try {
            // Cek status izin jika browser mendukung Permissions API
            const status = await navigator.permissions.query({ name: 'microphone' as PermissionName }).catch(() => null);
            if (status && status.state === 'granted') {
                return true;
            }
        } catch {
            // Ignore query errors
        }
    }

    // Dapatkan nama aplikasi dari path saat ini jika di browser
    const activeAppId = processManager.activeAppId || 'App';
    const appName = activeAppId.charAt(0).toUpperCase() + activeAppId.slice(1);

    // Tampilkan modal izin khas iOS
    const allowed = await dialogGlobalState.show({
        title: `"${appName}" Would Like to Access the Microphone`,
        message: 'This allows you to make audio calls with your contacts.',
        confirmText: 'OK',
        cancelText: 'Don\'t Allow'
    });

    if (allowed) {
        try {
            // Minta akses sungguhan ke browser
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            // Matikan langsung karena kita cuma mau minta izin saja
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch {
            // console.error("Microphone access denied by browser system:", err);
            // Jika user mengizinkan di UI tapi menolak di prompt browser
            return false;
        }
    }

    return false;
}
