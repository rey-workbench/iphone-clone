import { ApiConfig } from '$lib/framework/api/api';
import { fetchWithCache } from '$lib/framework/utils/fetchWithCache';

export class MailApiClient {
	static async getComments(limit: number = 15): Promise<any[]> {
		return await fetchWithCache(`${ApiConfig.MAIL_COMMENTS}?_limit=${limit}`);
	}
}
