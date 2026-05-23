const globalCache = new Map<string, any>();

export async function fetchWithCache(url: string, options?: RequestInit) {
    if (globalCache.has(url)) {
        return globalCache.get(url);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    globalCache.set(url, data);
    return data;
}

export function clearCache(url?: string) {
    if (url) {
        globalCache.delete(url);
    } else {
        globalCache.clear();
    }
}
