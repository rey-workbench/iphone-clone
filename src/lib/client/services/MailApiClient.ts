import { ApiConfig } from '$lib/config/api';
import { fetchWithCache } from '$lib/utils/fetchWithCache';

export class MailApiClient {
    static async getComments(limit: number = 15): Promise<any> {
        return await fetchWithCache(`${ApiConfig.MAIL_COMMENTS}?_limit=${limit}`);
    }
}
