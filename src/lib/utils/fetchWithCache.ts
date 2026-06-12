const globalCache = new Map<string, { data: any; timestamp: number }>();

export async function fetchWithCache(url: string, options?: RequestInit, ttlMs?: number) {
    if (globalCache.has(url)) {
        const cached = globalCache.get(url)!;
        if (!ttlMs || Date.now() - cached.timestamp < ttlMs) {
            return cached.data;
        }
    }

    const response = await fetch(url, options);
    const data = await response.json();
    globalCache.set(url, { data, timestamp: Date.now() });
    return data;
}

function clearCache(url?: string) {
    if (url) {
        globalCache.delete(url);
    } else {
        globalCache.clear();
    }
}
