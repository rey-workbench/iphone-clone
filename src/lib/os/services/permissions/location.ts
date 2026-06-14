import { dialogGlobalState } from '$lib/os/state';
import { processManager } from '$lib/os/kernel/ProcessManager.svelte';

/**
 * Request location permission from the user
 */
export async function requestLocation(): Promise<boolean> {
	if (typeof navigator !== 'undefined' && navigator.geolocation) {
		try {
			const status = await navigator.permissions
				.query({ name: 'geolocation' as PermissionName })
				.catch(() => null);
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
		title: `"${appName}" Would Like to Use Your Location`,
		message: 'This allows the app to show accurate weather forecasts for your current area.',
		confirmText: 'OK',
		cancelText: "Don't Allow"
	});

	if (allowed) {
		return new Promise((resolve) => {
			navigator.geolocation.getCurrentPosition(
				() => resolve(true),
				() => resolve(false),
				{ maximumAge: 10000, timeout: 5000, enableHighAccuracy: true }
			);
		});
	}

	return false;
}
