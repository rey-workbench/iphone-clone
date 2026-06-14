import type { IMusicSearchOptions } from '$lib/types';
import { ApiConfig } from '$lib/config/api';
import { fetchWithCache } from '$lib/utils/fetchWithCache';

export class MusicApiClient {
	static async search(options: IMusicSearchOptions): Promise<any> {
		const params = new URLSearchParams();
		if (options.action) params.append('action', options.action);
		if (options.q) params.append('q', options.q);
		if (options.type) params.append('type', options.type);
		if (options.title) params.append('title', options.title);
		if (options.artist) params.append('artist', options.artist);
		if (options.duration !== undefined) params.append('duration', String(options.duration));

		const queryString = params.toString();
		const url = `${ApiConfig.MUSIC_SEARCH}${queryString ? '?' + queryString : ''}`;
		return await fetchWithCache(url);
	}
}
