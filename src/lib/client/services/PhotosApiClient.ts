import { ApiDynamic } from '$lib/config/api/dynamic';
import { fetchWithCache } from '$lib/utils/fetchWithCache';

export class PhotosApiClient {
    static async getList(): Promise<any> {
        return await fetchWithCache(ApiDynamic.getPhotosList());
    }
}
