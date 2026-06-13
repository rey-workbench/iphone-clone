import { ApiDynamic } from '$lib/config/api/dynamic';
import { fetchWithCache } from '$lib/utils/fetchWithCache';

export class AppStoreApiClient {
    static async getProducts(): Promise<any> {
        return await fetchWithCache(ApiDynamic.getAppStoreProducts());
    }
}
