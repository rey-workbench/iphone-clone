import type { IPhotoItem } from '$lib/framework/types';
import { ApiConfig } from '$lib/framework/api/api';
import { fetchWithCache } from '$lib/framework/utils/fetchWithCache';

export class PhotosApiClient {
	static async getList(page: number = 1, limit: number = 30): Promise<{ photos: IPhotoItem[] }> {
		return await fetchWithCache(`${ApiConfig.PHOTOS_LIST}?page=${page}&limit=${limit}`);
	}
}
