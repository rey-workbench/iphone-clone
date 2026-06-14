import type { IAppStoreData } from '$lib/types';
import { ApiConfig } from '$lib/config/api';
import { fetchWithCache } from '$lib/utils/fetchWithCache';

export class AppStoreApiClient {
    static async getProducts(limit: number = 11, skip: number = 10): Promise<IAppStoreData> {
        return await fetchWithCache(`${ApiConfig.APP_STORE_PRODUCTS}?limit=${limit}&skip=${skip}`);
    }
}
