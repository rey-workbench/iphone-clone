import type { IPhotoItem } from '$lib/framework/types';
import { ApiConfig, apiFetch } from '$lib/framework/api/api';
export class PhotosApiClient {
	static async getList(page: number = 1, limit: number = 30): Promise<{ photos: IPhotoItem[] }> {
		return (await apiFetch(`${ApiConfig.PHOTOS_LIST}?page=${page}&limit=${limit}`, { useCache: true })).json();
	}
}
