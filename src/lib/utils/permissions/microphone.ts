import { dialogState } from '$lib/states/dialogState.svelte';
import { systemState } from '$lib/states/systemState.svelte';

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
        } catch (e) {
            // Ignore query errors
        }
    }

    // Dapatkan nama aplikasi yang sedang aktif untuk judul dialog yang dinamis
    const activeAppId = systemState.activeApp || 'App';
    const appName = activeAppId.charAt(0).toUpperCase() + activeAppId.slice(1);

    // Tampilkan modal izin khas iOS
    const allowed = await dialogState.show({
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
        } catch (err) {
            console.error("Microphone access denied by browser system:", err);
            // Jika user mengizinkan di UI tapi menolak di prompt browser
            return false;
        }
    }

    return false;
}
