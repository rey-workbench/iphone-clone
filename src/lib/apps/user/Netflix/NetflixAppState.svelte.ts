import { dialogGlobalState } from '$lib/os/state/dialogGlobalState.svelte';
import { NetflixApiClient } from '$lib/framework/api/services/NetflixApiClient';
import type { INetflixMedia, INetflixSeason, INetflixDetails } from '$lib/framework/types';

import { BaseGlobalState } from '$lib/os/state/baseGlobalState.svelte';

export class NetflixAppState extends BaseGlobalState {
	appName = 'Netflix';
	view = $state<'home' | 'detail' | 'player'>('home');
	selectedMedia = $state<INetflixMedia | null>(null);

	// We can fetch TMDB data directly from client using a public proxy or user key if provided.
	// For the sake of this mock app, if TMDB key is absent, we can provide a few mock trending items,
	// or instruct the user to configure the backend endpoint later.

	// To keep it functional without a key immediately, we'll try to fetch from TMDB
	// using a proxy if possible, or fallback.
	movies = $state<INetflixMedia[]>([]);
	tvShows = $state<INetflixMedia[]>([]);
	isLoading = $state(false);

	searchQuery = $state('');
	serverSearchResults = $state<INetflixMedia[]>([]);

	// Local client-side filter — only runs when movies/tvShows/searchQuery change
	localSearchResults = $derived.by(() => {
		const q = this.searchQuery.toLowerCase();
		return [
			...this.movies.filter((m: INetflixMedia) =>
				(m.title || m.name || '').toLowerCase().includes(q)
			),
			...this.tvShows.filter((m: INetflixMedia) =>
				(m.title || m.name || '').toLowerCase().includes(q)
			)
		];
	});

	details = $state<INetflixDetails>({
		cast: 'Loading...',
		creator: 'Loading...',
		trailerId: null as string | null,
		showTrailer: false,
		seasons: [] as INetflixSeason[],
		isLoading: true
	});

	private searchTimeout: ReturnType<typeof setTimeout> | undefined;
	private idleTimer: ReturnType<typeof setTimeout> | undefined;

	constructor() {
		super();
		this.fetchTrending();
	}

	async fetchTrending() {
		this.isLoading = true;
		try {
			const { res, result: data } = await NetflixApiClient.getTrending();
			if (res.ok && data) {
				const mapMedia = (m: INetflixMedia) => ({
					...m,
					poster_path: m.poster_path?.startsWith('/')
						? `https://image.tmdb.org/t/p/w500${m.poster_path}`
						: m.poster_path,
					backdrop_path: m.backdrop_path?.startsWith('/')
						? `https://image.tmdb.org/t/p/w500${m.backdrop_path}`
						: m.backdrop_path
				});

				this.movies = (data.movies || []).map(mapMedia);
				this.tvShows = (data.tv || []).map(mapMedia);
			} else {
				// Fallback mock data if endpoint is not configured
				this.movies = this.getMockMovies();
				this.tvShows = this.getMockTv();
			}
		} catch {
			this.movies = this.getMockMovies();
			this.tvShows = this.getMockTv();
		}
		this.isLoading = false;
	}

	search(query: string) {
		this.searchQuery = query;
		if (query.trim().length > 2) {
			clearTimeout(this.searchTimeout);
			this.searchTimeout = setTimeout(async () => {
				try {
					const { res, result: data } = await NetflixApiClient.search(query);
					if (res.ok && data) {
						const mapMedia = (m: INetflixMedia) => ({
							...m,
							poster_path: m.poster_path?.startsWith('/')
								? `https://image.tmdb.org/t/p/w500${m.poster_path}`
								: m.poster_path,
							backdrop_path: m.backdrop_path?.startsWith('/')
								? `https://image.tmdb.org/t/p/w500${m.backdrop_path}`
								: m.backdrop_path
						});
						this.serverSearchResults = (data.results || []).map(mapMedia);
					}
				} catch (e: unknown) {
					dialogGlobalState.show({
						title: 'Search Error',
						message: (e as Error).message || 'Failed to search Netflix',
						confirmText: 'OK'
					});
				}
			}, 500);
		} else {
			this.serverSearchResults = [];
		}
	}

	async fetchDetails(media: INetflixMedia, isTvShow: boolean) {
		if (!media?.id) return;
		this.details.isLoading = true;
		this.details.cast = 'Loading...';
		this.details.creator = 'Loading...';
		this.details.trailerId = null;
		this.details.showTrailer = false;
		try {
			const type = isTvShow ? 'tv' : 'movie';
			const { result: data } = await NetflixApiClient.getDetails(Number(media.id), type);
			if (!data.error) {
				this.details.cast = data.cast || 'Unknown';
				this.details.creator = data.creator || 'Unknown';
				this.details.trailerId = data.trailerId;
				this.details.seasons = data.seasons || [];
			}
		} catch (e: unknown) {
			dialogGlobalState.show({
				title: 'Details Error',
				message: (e as Error).message || 'Failed to fetch movie details',
				confirmText: 'OK'
			});
		} finally {
			this.details.isLoading = false;
		}
	}

	startIdleTimer(isPlaying: boolean) {
		clearTimeout(this.idleTimer);
		this.details.showTrailer = false;
		this.idleTimer = setTimeout(() => {
			if (!isPlaying && this.details.trailerId) {
				this.details.showTrailer = true;
			}
		}, 4000);
	}

	clearIdleTimer() {
		clearTimeout(this.idleTimer);
	}

	selectMedia(item: INetflixMedia) {
		this.selectedMedia = item;
		this.view = 'detail';
		if (typeof window !== 'undefined') window.history.pushState({ netflixModal: 'detail' }, '');
	}

	playMedia() {
		this.view = 'player';
		if (typeof window !== 'undefined') window.history.pushState({ netflixModal: 'player' }, '');
	}

	goBack(fromPopState = false) {
		if (this.view === 'player') {
			this.view = 'detail';
			if (!fromPopState && typeof window !== 'undefined') window.history.back();
		} else if (this.view === 'detail') {
			this.view = 'home';
			this.selectedMedia = null;
			if (!fromPopState && typeof window !== 'undefined') window.history.back();
		}
	}

	// Mock data for immediate preview
	getMockMovies() {
		return [
			{
				id: 597,
				title: 'Titanic',
				overview:
					'101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic.',
				poster_path: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
				backdrop_path: 'https://image.tmdb.org/t/p/w500/rzdPqYx7Um4FUZeD8ucX1mqkYBg.jpg',
				vote_average: 7.9,
				media_type: 'movie'
			},
			{
				id: 157336,
				title: 'Interstellar',
				overview:
					'The adventures of a group of explorers who make use of a newly discovered wormhole.',
				poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
				backdrop_path: 'https://image.tmdb.org/t/p/w500/xJHokMbljvjSCi5x2uixwsqV431.jpg',
				vote_average: 8.4,
				media_type: 'movie'
			},
			{
				id: 293660,
				title: 'Deadpool',
				overview:
					'The origin story of former Special Forces operative turned mercenary Wade Wilson.',
				poster_path: 'https://image.tmdb.org/t/p/w500/3E53WEZJqP6aM84D8CckDx4Np1E.jpg',
				backdrop_path: 'https://image.tmdb.org/t/p/w500/7aPrv2HFssWcOtpiggNEY46jc.jpg',
				vote_average: 7.6,
				media_type: 'movie'
			}
		];
	}

	getMockTv() {
		return [
			{
				id: 1396,
				title: 'Breaking Bad',
				overview:
					'When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer...',
				poster_path: 'https://image.tmdb.org/t/p/w500/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg',
				backdrop_path: 'https://image.tmdb.org/t/p/w500/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
				vote_average: 8.9,
				media_type: 'tv'
			},
			{
				id: 66732,
				title: 'Stranger Things',
				overview:
					'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.',
				poster_path: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8Slgw3kdA.jpg',
				backdrop_path: 'https://image.tmdb.org/t/p/w500/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
				vote_average: 8.6,
				media_type: 'tv'
			}
		];
	}
}

export const netflixState = new NetflixAppState();
