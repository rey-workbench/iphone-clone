import { ApiDynamic } from '$lib/config/api/dynamic';
import { fetchWithCache } from '$lib/utils/fetchWithCache';

export class MailApiClient {
    static async getComments(): Promise<any> {
        return await fetchWithCache(ApiDynamic.getMailComments());
    }
}
