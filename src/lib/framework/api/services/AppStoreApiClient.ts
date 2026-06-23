import type { IAppStoreData } from '$lib/framework/types';
import { ApiConfig, apiFetch } from '$lib/framework/api/api';
export class AppStoreApiClient {
	static async getProducts(limit: number = 11, skip: number = 10): Promise<IAppStoreData> {
		return (await apiFetch(`${ApiConfig.APP_STORE_PRODUCTS}?limit=${limit}&skip=${skip}`, { useCache: true })).json();
	}
}
