<script lang="ts">
	import { netflixState } from '../NetflixAppState.svelte';
	import type { INetflixMedia } from '$lib/types';

	const { media, isTvShow, selectedSeason, selectedEpisode, iframeSrc, isPlaying } = $props<{
		media: INetflixMedia;
		isTvShow: boolean;
		selectedSeason: number;
		selectedEpisode: number;
		iframeSrc: string;
		isPlaying: boolean;
	}>();
</script>

<!-- Media Player & Thumbnail Container -->
<div class="relative w-full aspect-video bg-black shrink-0 overflow-hidden">
	<!-- Iframe always running in background to burn through the "Ad-Free" countdown -->
	{#key `${isTvShow}-${selectedSeason}-${selectedEpisode}`}
		<iframe
			src={iframeSrc}
			title="Netflix Player"
			class="absolute inset-0 w-full h-full z-20"
			style:width="100%"
			style:height="100%"
			frameborder="0"
			referrerpolicy="origin"
			allowfullscreen
		></iframe>
	{/key}

	<!-- Hero Thumbnail Overlay (Hides Iframe until Play is clicked) -->
	{#if !isPlaying}
		<div class="absolute inset-0 w-full h-full bg-black z-10 animate-[fadeIn_0.3s_ease]">
			<!-- Background Image or Trailer -->
			{#if netflixState.details.showTrailer && netflixState.details.trailerId}
				<iframe
					src="https://www.youtube.com/embed/{netflixState.details
						.trailerId}?autoplay=1&mute=1&controls=0&playsinline=1&modestbranding=1&loop=1&playlist={netflixState
						.details.trailerId}"
					class="w-full h-full object-cover scale-[1.35] pointer-events-none opacity-80"
					frameborder="0"
					allow="autoplay; encrypted-media; picture-in-picture"
					title="Trailer"
				></iframe>
			{:else}
				<div
					class="w-full h-full bg-cover bg-center transition-opacity duration-500"
					style:background-image="url({media.backdrop_path || media.poster_path})"
				></div>

				<!-- Play button overlay (Only visible when trailer hasn't started) -->
				<div
					class="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none"
				>
					<div
						class="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center bg-black/40"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							viewBox="0 0 24 24"
							fill="white"
							class="ml-1"><path d="M8 5v14l11-7z" /></svg
						>
					</div>
				</div>
			{/if}

			<div
				class="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent pointer-events-none"
			></div>
		</div>
	{/if}
</div>
