import type { IEmail } from '$lib/types';
import { ApiConfig } from '$lib/config/api';
import { fetchWithCache } from '$lib/utils/fetchWithCache';

export class MailApiClient {
    static async getComments(limit: number = 15): Promise<IEmail[]> {
        return await fetchWithCache(`${ApiConfig.MAIL_COMMENTS}?_limit=${limit}`);
    }
}
