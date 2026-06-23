import { ApiConfig, apiFetch } from '$lib/framework/api/api';

export class SafariApiClient {
	static async search(
		query: string
	): Promise<{ res: Response; result: { error?: string; data?: any[] } }> {
		const res = await apiFetch(`${ApiConfig.SAFARI_SEARCH}?q=${encodeURIComponent(query)}`);
		return { res, result: await res.json() };
	}
}
