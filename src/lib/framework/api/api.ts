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

export async function apiFetch(
	url: string | URL,
	options: RequestInit & { requireAuth?: boolean } = {}
): Promise<Response> {
	const { requireAuth = true, ...fetchOptions } = options;

	if (requireAuth) {
		const headers = getAuthHeaders();
		if (!headers['X-User-Id']) {
			return new Response(
				JSON.stringify({ success: false, error: 'Unauthorized access (client-prevented)' }),
				{
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}
		fetchOptions.headers = {
			...fetchOptions.headers,
			...headers
		};
	}

	return await fetch(url, fetchOptions);
}
