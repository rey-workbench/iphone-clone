<script lang="ts">
	import { netflixState } from '../NetflixAppState.svelte';
	import { NetflixApiClient } from '$lib/framework/api/services/NetflixApiClient';
	import { dialogGlobalState } from '$lib/os/state/dialogGlobalState.svelte';

	import MovieHero from './MovieHero.svelte';
	import MovieInfo from './MovieInfo.svelte';

	const media = $derived(netflixState.selectedMedia);
	const isTvShow = $derived(media?.media_type === 'tv' || media?.title === undefined);
	const title = $derived(media?.title || media?.name || 'Unknown Title');

	let isPlaying = $state(false);

	// Trap framebuster's history.back() immediately when modal opens
	$effect(() => {
		if (typeof window !== 'undefined') {
			for (let i = 0; i < 3; i++) {
				window.history.pushState({ dummy: true, index: i }, '');
			}
		}
	});
	let isFullscreen = $state(false);
	let selectedSeason = $state(1);
	let selectedEpisode = $state(1);
	let currentServer = $state(1);

	// Reset episode to 1 when the viewed content changes
	$effect(() => {
		if (media?.id) selectedEpisode = 1;
	});

	const iframeSrc = $derived(
		isTvShow
			? NetflixApiClient.getTvStreamUrl(
					media?.id || '',
					selectedSeason,
					selectedEpisode,
					currentServer
				)
			: NetflixApiClient.getMovieStreamUrl(media?.id || '', currentServer)
	);

	function closeFullscreen() {
		isFullscreen = false;
	}

	const handleGoBack = () => netflixState.goBack();
	const handlePlay = () => (isPlaying = true);
	const handleSetServer = (e: MouseEvent) => {
		const server = Number((e.currentTarget as HTMLElement).dataset.server);
		if (!isNaN(server)) currentServer = server;
	};

	$effect(() => {
		// Block malicious framebusting redirects unconditionally
		const preventRedirect = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = '';
			return '';
		};
		window.addEventListener('beforeunload', preventRedirect);

		const handleVisibilityChange = () => {
			if (document.hidden && isPlaying) {
				dialogGlobalState.show({
					title: 'Iklan Terdeteksi',
					message:
						'Server video baru saja membuka tab iklan. Silakan tutup tab tersebut secara manual jika masih terbuka.\n\nUntuk pengalaman menonton terbaik tanpa gangguan popup dan iklan, kami menyarankan Anda menggunakan Brave Browser.',
					confirmText: 'Mengerti'
				});
			}
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			window.removeEventListener('beforeunload', preventRedirect);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});

	$effect(() => {
		if (media) {
			netflixState.fetchDetails(media, isTvShow).then(() => {
				if (netflixState.details.seasons.length > 0) {
					selectedSeason = netflixState.details.seasons[0].season_number;
				}
				netflixState.startIdleTimer(isPlaying);
			});
		}
	});

	$effect(() => () => () => {
		netflixState.clearIdleTimer();
	});
</script>

<!-- Fullscreen Landscape Overlay — rendered outside scroll container -->
{#if isPlaying && isFullscreen}
	<div
		class="fixed z-99999 bg-black"
		style:top="0"
		style:left="0"
		style:width="100vh"
		style:height="100vw"
		style:transform-origin="top left"
		style:transform="rotate(90deg) translateY(-100%)"
	>
		{#key `${isTvShow}-${selectedSeason}-${selectedEpisode}-fs`}
			<iframe
				src={iframeSrc}
				title="Netflix Player"
				class="w-full h-full pointer-events-auto"
				style:width="100%"
				style:height="100%"
				frameborder="0"
				referrerpolicy="origin"
				allowfullscreen
			></iframe>
		{/key}
		<!-- Exit Fullscreen Button -->
		<button
			type="button"
			class="absolute top-4 right-4 z-9 text-white bg-black/70 rounded-full p-2 hover:bg-black/90"
			onclick={closeFullscreen}
			aria-label="Exit Fullscreen"
		>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				width="22"
				height="22"
			>
				<path
					d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
				/>
			</svg>
		</button>
	</div>
{/if}

<!-- Main Detail Page -->
<div
	class="w-full h-full bg-black text-white flex flex-col font-sans overflow-y-auto no-scrollbar pb-20 pt-13.5"
>
	<!-- Header (Safe Area) -->
	<div class="flex justify-between items-center px-4 mb-4 shrink-0 pointer-events-none">
		<button
			type="button"
			aria-label="Back"
			class="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors pointer-events-auto"
			onclick={handleGoBack}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
			>
		</button>
		{#if !isPlaying}
			<button
				type="button"
				aria-label="Cast"
				class="w-8 h-8 flex items-center justify-center text-white bg-black/40 rounded-full backdrop-blur-md pointer-events-auto hover:bg-black/70 transition-colors"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><rect width="20" height="15" x="2" y="7" rx="2" ry="2" /><path
						d="M17 7V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2"
					/></svg
				>
			</button>
		{/if}
	</div>

	{#if media}
		<!-- Media Player & Thumbnail Container -->
		<MovieHero {media} {isTvShow} {selectedSeason} {selectedEpisode} {iframeSrc} {isPlaying} />

		<!-- Content Details -->
		<MovieInfo
			{media}
			{isTvShow}
			{title}
			{currentServer}
			onPlay={handlePlay}
			onSetServer={handleSetServer}
			bind:selectedSeason
			bind:selectedEpisode
			bind:isPlaying
		/>
	{/if}
</div>

<style>
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
