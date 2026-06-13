import { ApiDynamic } from '$lib/config/api/dynamic';
import { fetchWithCache } from '$lib/utils/fetchWithCache';
import type { IMusicSearchOptions } from '$lib/types/music';

export class MusicApiClient {
    static async search(options: IMusicSearchOptions): Promise<any> {
        return await fetchWithCache(ApiDynamic.getMusicSearch(options));
    }
}
