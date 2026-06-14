import { apiHandler, ApiError } from '$lib/backend/api';
import { YoutubeSearchService } from '$lib/backend/services/YoutubeSearchService';
import { json } from '@sveltejs/kit';

const ytSearchService = new YoutubeSearchService();

export function GET({ url }) {
	return apiHandler(async () => {
		const query = url.searchParams.get('q');
		const action = url.searchParams.get('action');

		switch (action) {
			case 'suggestions':
				if (query) return json(await ytSearchService.getSuggestions(query));
				break;
			case 'lyrics':
				if (query) {
					const title = url.searchParams.get('title');
					const artist = url.searchParams.get('artist');
					const duration = url.searchParams.get('duration');
					return json(await ytSearchService.getLyrics(query, title, artist, duration));
				}
				break;
			case 'upnext':
				if (query) return json(await ytSearchService.getUpNext(query));
				break;
			case 'playlist_tracks':
				if (query)
					return json(await ytSearchService.getPlaylistTracks(query, url.searchParams.get('type')));
				break;
			default:
				// browse, library, radio, or default search
				return json(await ytSearchService.searchOrBrowse(query, action));
		}

		throw new ApiError(400, 'Invalid request or missing query parameters');
	});
}
