import { apiWrapper, ApiError } from '$lib/backend/api';
import { YoutubeSearchService } from '$lib/backend/services/YoutubeSearchService';
import { RateLimiter } from '$lib/backend/security/RateLimiter';
import { SearchQuerySchema } from '$lib/backend/validation/Validation';

const ytSearchService = new YoutubeSearchService();
const searchRateLimiter = new RateLimiter(60 * 1000, 20, 5 * 60 * 1000); // 20 requests per minute

export const GET = apiWrapper(
	async ({ url }) => {
		let query = url.searchParams.get('q');
		const action = url.searchParams.get('action');

		if (query) {
			query = SearchQuerySchema.parse(query);
		}

		switch (action) {
			case 'suggestions':
				if (query) return await ytSearchService.getSuggestions(query);
				break;
			case 'lyrics':
				if (query) {
					const title = url.searchParams.get('title');
					const artist = url.searchParams.get('artist');
					const duration = url.searchParams.get('duration');
					return await ytSearchService.getLyrics(query, title, artist, duration);
				}
				break;
			case 'upnext':
				if (query) return await ytSearchService.getUpNext(query);
				break;
			case 'playlist_tracks':
				if (query)
					return await ytSearchService.getPlaylistTracks(query, url.searchParams.get('type'));
				break;
			default:
				// browse, library, radio, or default search
				return await ytSearchService.searchOrBrowse(query, action);
		}

		throw new ApiError(400, 'Invalid request or missing query parameters');
	},
	{ requireAuth: true, customRateLimiter: searchRateLimiter }
);
