import { apiWrapper } from '$lib/backend/api';
import { SafariSearchService } from '$lib/backend/services/SafariSearchService';
import { RateLimiter } from '$lib/backend/security/RateLimiter';
import { SearchQuerySchema } from '$lib/backend/validation/Validation';

const safariSearchService = new SafariSearchService();
const searchRateLimiter = new RateLimiter(60 * 1000, 20, 5 * 60 * 1000); // 20 requests per minute

export const GET = apiWrapper(
	async ({ url }) => {
		const rawQuery = url.searchParams.get('q');
		const query = SearchQuerySchema.parse(rawQuery || '');

		return await safariSearchService.search(query);
	},
	{ requireAuth: false, customRateLimiter: searchRateLimiter }
);
