import { ApiConfig, apiFetch } from '$lib/framework/api/api';
export class MailApiClient {
	static async getComments(limit: number = 15): Promise<any[]> {
		return (await apiFetch(`${ApiConfig.MAIL_COMMENTS}?_limit=${limit}`, { useCache: true })).json();
	}
}
