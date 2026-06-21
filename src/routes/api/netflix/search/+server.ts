import { apiWrapper } from '$lib/backend/api';
import { NetflixService } from '$lib/backend/services/NetflixService';
import { RateLimiter } from '$lib/backend/security/RateLimiter';
import { SearchQuerySchema } from '$lib/backend/validation/Validation';

const netflixService = new NetflixService();
const netflixRateLimiter = new RateLimiter(60 * 1000, 30, 5 * 60 * 1000); // 30 requests per minute

export const GET = apiWrapper(async ({ url }) => {
	const rawQuery = url.searchParams.get('q');
	const query = SearchQuerySchema.parse(rawQuery || '');

	const data = await netflixService.search(query);
	return data;
}, { customRateLimiter: netflixRateLimiter });
