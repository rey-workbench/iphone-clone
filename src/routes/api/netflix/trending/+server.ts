import { apiWrapper } from '$lib/backend/api';
import { NetflixService } from '$lib/backend/services/NetflixService';
import { RateLimiter } from '$lib/backend/security/RateLimiter';

const netflixService = new NetflixService();
const netflixRateLimiter = new RateLimiter(60 * 1000, 30, 5 * 60 * 1000); // 30 requests per minute

export const GET = apiWrapper(
	async () => {
		const data = await netflixService.getTrending();
		return data;
	},
	{ requireAuth: true, customRateLimiter: netflixRateLimiter }
);
