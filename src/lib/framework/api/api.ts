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

const globalCache = new Map<string, { data: unknown; timestamp: number }>();

export async function apiFetch(
	url: string | URL,
	options: RequestInit & { requireAuth?: boolean; useCache?: boolean; ttlMs?: number } = {}
): Promise<Response> {
	const { requireAuth = true, useCache = false, ttlMs, ...fetchOptions } = options;
	const urlStr = url.toString();

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

	if (useCache && globalCache.has(urlStr)) {
		const cached = globalCache.get(urlStr)!;
		if (!ttlMs || Date.now() - cached.timestamp < ttlMs) {
			return new Response(JSON.stringify(cached.data), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}

	const response = await fetch(url, fetchOptions);

	if (useCache && response.ok) {
		const cloned = response.clone();
		try {
			const data = await cloned.json();
			globalCache.set(urlStr, { data, timestamp: Date.now() });
		} catch {
			// ignore cache for non-JSON
		}
	}

	return response;
}

export function clearApiCache(url?: string) {
	if (url) {
		globalCache.delete(url);
	} else {
		globalCache.clear();
	}
}
