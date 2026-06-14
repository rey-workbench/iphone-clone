import type { IAppStoreData } from '$lib/framework/types';
import { ApiConfig } from '$lib/framework/api/api';
import { fetchWithCache } from '$lib/framework/utils/fetchWithCache';

export class AppStoreApiClient {
	static async getProducts(limit: number = 11, skip: number = 10): Promise<IAppStoreData> {
		return await fetchWithCache(`${ApiConfig.APP_STORE_PRODUCTS}?limit=${limit}&skip=${skip}`);
	}
}
