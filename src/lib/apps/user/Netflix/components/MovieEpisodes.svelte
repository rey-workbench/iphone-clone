<script lang="ts">
	import { netflixState } from '../NetflixAppState.svelte';
	import type { INetflixMedia } from '$lib/framework/types';

	let {
		media,
		selectedSeason = $bindable(1),
		selectedEpisode = $bindable(1),
		isPlaying = $bindable(false)
	} = $props<{
		media: INetflixMedia;
		selectedSeason: number;
		selectedEpisode: number;
		isPlaying: boolean;
	}>();

	const handleSelectEpisode = (e: MouseEvent) => {
		const episode = Number((e.currentTarget as HTMLElement).dataset.episode);
		if (!isNaN(episode)) {
			selectedEpisode = episode;
			isPlaying = true;
		}
	};

	const handleSelectEpisodeKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const episode = Number((e.currentTarget as HTMLElement).dataset.episode);
			if (!isNaN(episode)) {
				selectedEpisode = episode;
				isPlaying = true;
			}
		}
	};
</script>

<div class="mt-2">
	<select
		id="season-select"
		aria-label="Select Season"
		class="bg-[#2b2b2b] text-white px-4 py-2 rounded text-sm font-medium border-none outline-none mb-4"
		bind:value={selectedSeason}
	>
		{#each netflixState.details.seasons as s (s.id || s)}
			<option value={s.season_number}>{s.name}</option>
		{/each}
	</select>
	<div class="flex flex-col gap-6">
		{#each Array.from( { length: netflixState.details.seasons.find((s) => s.season_number === selectedSeason)?.episode_count || 1 } ) as _, i (i)}
			<div class="flex flex-col gap-2">
				<div
					class="flex items-center gap-3 cursor-pointer group"
					role="button"
					tabindex="0"
					data-episode={i + 1}
					onclick={handleSelectEpisode}
					onkeydown={handleSelectEpisodeKey}
				>
					<div
						class="relative w-32.5 h-18.75 shrink-0 bg-[#2b2b2b] rounded flex items-center justify-center overflow-hidden"
					>
						<img
							src={media?.backdrop_path}
							alt="Episode {i + 1}"
							class="absolute inset-0 w-full h-full object-cover opacity-60"
						/>
						{#if selectedEpisode === i + 1 && isPlaying}
							<div class="text-xs font-bold text-red-600 z-10">Playing</div>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="white"
								class="z-10 group-hover:scale-110 transition-transform"
							>
								<circle
									cx="12"
									cy="12"
									r="10"
									stroke="white"
									stroke-width="1"
									fill="rgba(0,0,0,0.5)"
								/>
								<path d="M10 8l6 4-6 4V8z" />
							</svg>
						{/if}
					</div>
					<div class="flex flex-col flex-1">
						<div class="flex justify-between items-center mb-1">
							<div class="text-sm text-white font-medium">Episode {i + 1}</div>
						</div>
					</div>
				</div>
				<p class="text-[13px] text-gray-400 leading-snug">
					{media?.overview
						? media.overview.substring(0, 100) + '...'
						: 'An exciting episode full of twists and turns.'}
				</p>
			</div>
		{/each}
	</div>
</div>
