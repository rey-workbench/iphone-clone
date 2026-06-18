import { BaseGlobalState } from '$lib/os/state/baseGlobalState.svelte';
import parser from 'iptv-playlist-parser';

export interface IPTVChannel {
	name: string;
	url: string;
	logo?: string;
	group?: string;
}

export class AppleTVAppState extends BaseGlobalState {
	appName = 'Apple TV';
	view = $state<'home' | 'appletvplus' | 'store' | 'library' | 'search'>('home');

	// Mock data based on Apple TV interface
	topChart = [
		{
			id: 1,
			title: 'The Morning Show',
			genre: 'Drama',
			rank: 1,
			poster: 'https://image.tmdb.org/t/p/w500/A0K0xHj0x5d9wAAMrI0zO9y1yO3.jpg'
		},
		{
			id: 2,
			title: 'Monarch: Legacy of Monsters',
			genre: 'Adventure',
			rank: 2,
			poster: 'https://image.tmdb.org/t/p/w500/uKVZhA1B8jQG74Qh3Z4iA1o2H7x.jpg'
		}
	];

	channels = [
		{
			id: 'tvplus',
			name: 'Apple TV+',
			bgClass: 'bg-[#1C1C1E]',
			logo: '/assets/icons/com.apple.tv-large.png'
		},
		{
			id: 'mlspass',
			name: 'MLS Season Pass',
			bgClass: 'bg-black',
			logo: ''
		},
		{
			id: 'max',
			name: 'Max',
			bgClass: 'bg-[#0F1CDB]',
			logo: ''
		}
	];

	nowOnTvPlus = [
		{
			id: 3,
			title: 'For All Mankind',
			poster: 'https://image.tmdb.org/t/p/w500/1Xm0W6sO1X40r8x4y9w8o0N6l6Z.jpg'
		},
		{
			id: 4,
			title: 'Hijack',
			poster: 'https://image.tmdb.org/t/p/w500/3A6r9zW41eM0k2T9874vO8sA0B9.jpg'
		}
	];

	iptvChannels = $state<IPTVChannel[]>([]);
	activeChannel = $state<IPTVChannel | null>(null);
	isIptvLoading = $state(false);

	constructor() {
		super();
		this.fetchIPTV();
	}

	selectTab(tab: 'home' | 'appletvplus' | 'store' | 'library' | 'search') {
		this.view = tab;
	}

	async fetchIPTV() {
		this.isIptvLoading = true;
		try {
			// Fetch multiple lightweight playlists to get Indo + Sports + Specific countries
			// This avoids downloading the massive 28MB index.m3u
			const urls = [
				'https://iptv-org.github.io/iptv/countries/id.m3u', // Indonesia (Temporarily removed)
				'https://iptv-org.github.io/iptv/categories/sports.m3u', // Global Sports
				'https://iptv-org.github.io/iptv/countries/cz.m3u', // Czech (for ČT Sport)
				'https://iptv-org.github.io/iptv/countries/de.m3u', // Germany (for Das Erste)
				'https://iptv-org.github.io/iptv/countries/tr.m3u', // Turkey (for TRT 1)
				'https://iptv-org.github.io/iptv/countries/br.m3u', // Brazil (for CazeTV)
			];

			const responses = await Promise.all(urls.map(url => fetch(url).catch(() => null)));
			
			let combinedItems: any[] = [];
			for (const res of responses) {
				if (res && res.ok) {
					const text = await res.text();
					const result = parser.parse(text);
					combinedItems = combinedItems.concat(result.items);
				}
			}
			
			// Remove duplicates based on URL and format the channels
			const uniqueChannels: IPTVChannel[] = [];
			const seenUrls = new Set();
			
			for (const item of combinedItems) {
				if (!seenUrls.has(item.url)) {
					seenUrls.add(item.url);
					uniqueChannels.push({
						name: item.name || 'Unknown',
						url: item.url,
						logo: item.tvg?.logo || '',
						group: item.group?.title || 'General'
					});
				}
			}
			
			this.iptvChannels = uniqueChannels;
		} catch (error) {
			console.error('IPTV fetch error:', error);
		} finally {
			this.isIptvLoading = false;
		}
	}
	
	playChannel(channel: IPTVChannel) {
		this.activeChannel = channel;
	}
	
	closePlayer() {
		this.activeChannel = null;
	}
}

export const appleTvState = new AppleTVAppState();
