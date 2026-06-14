import { ApiConfig } from '$lib/config/api';

export class SafariApiClient {
    static async search(query: string): Promise<{ res: Response; result: { error?: string, data?: any[] } }> {
        const res = await fetch(`${ApiConfig.SAFARI_SEARCH}?q=${encodeURIComponent(query)}`);
        return { res, result: await res.json() };
    }
}
