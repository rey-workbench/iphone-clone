import { ApiEndpoints } from './config/endpoints';
import { systemGlobalState } from '$lib/os/state';

export const ApiConfig = {
	...ApiEndpoints
};

export function getAuthHeaders() {
	return {
		'X-User-Id': systemGlobalState.currentUser?.id || '',
		'X-Device-Id': systemGlobalState.deviceId || ''
	};
}
