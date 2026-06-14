import { ApiConfig } from '$lib/config/api';
import { fetchWithCache } from '$lib/utils/fetchWithCache';

export class PhotosApiClient {
    static async getList(page: number = 1, limit: number = 30): Promise<any> {
        return await fetchWithCache(`${ApiConfig.PHOTOS_LIST}?page=${page}&limit=${limit}`);
    }
}
