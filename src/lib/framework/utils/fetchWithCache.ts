const globalCache = new Map<string, { data: unknown; timestamp: number }>();

export async function fetchWithCache<T>(
	url: string,
	options?: RequestInit,
	ttlMs?: number
): Promise<T> {
	if (globalCache.has(url)) {
		const cached = globalCache.get(url)!;
		if (!ttlMs || Date.now() - cached.timestamp < ttlMs) {
			return cached.data as T;
		}
	}

	const response = await fetch(url, options);
	const data = await response.json();
	globalCache.set(url, { data, timestamp: Date.now() });
	return data as T;
}

export function clearCache(url?: string) {
	if (url) {
		globalCache.delete(url);
	} else {
		globalCache.clear();
	}
}
