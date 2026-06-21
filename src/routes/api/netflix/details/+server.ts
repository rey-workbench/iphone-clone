import { apiWrapper } from '$lib/backend/api';
import { NetflixService } from '$lib/backend/services/NetflixService';
import { RateLimiter } from '$lib/backend/security/RateLimiter';

const netflixService = new NetflixService();
const netflixRateLimiter = new RateLimiter(60 * 1000, 30, 5 * 60 * 1000); // 30 requests per minute

export const GET = apiWrapper(
	async ({ url }) => {
		const id = url.searchParams.get('id');
		const type = url.searchParams.get('type') || 'movie';

		if (!id) throw new Error('ID is required');

		const data = await netflixService.getDetails(id, type);
		return data;
	},
	{ customRateLimiter: netflixRateLimiter }
);
