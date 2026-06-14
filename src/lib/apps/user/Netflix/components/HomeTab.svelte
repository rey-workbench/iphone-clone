<script lang="ts">
	import { netflixState } from '../NetflixAppState.svelte';
	import Skeleton from '$lib/framework/ui/Skeleton.svelte';
	import { Plus, Info } from '@lucide/svelte';

	const { handleScroll } = $props<{ handleScroll: (e: Event) => void }>();

	const previews = $derived(netflixState.tvShows.slice(0, 6));
	const popular = $derived(netflixState.movies.slice(0, 10));
	const trending = $derived(netflixState.tvShows.slice(0, 10));

	const handleSelectMovie = (e: MouseEvent) => {
		const id = (e.currentTarget as HTMLElement).dataset.id;
		if (id) {
			const movie = netflixState.movies.find((m) => String(m.id) === id);
			if (movie) netflixState.selectMedia(movie);
		}
	};

	const handleSelectTv = (e: MouseEvent) => {
		const id = (e.currentTarget as HTMLElement).dataset.id;
		if (id) {
			const tv = netflixState.tvShows.find((t) => String(t.id) === id);
			if (tv) netflixState.selectMedia(tv);
		}
	};

	const handlePlayHero = () => {
		if (netflixState.movies.length > 0) {
			netflixState.selectMedia(netflixState.movies[0]);
		}
	};
</script>

<div class="w-full h-full overflow-y-auto pb-20 no-scrollbar relative z-10" onscroll={handleScroll}>
	<!-- Hero Banner -->
	{#if netflixState.movies.length > 0}
		<div class="relative w-full h-[550px] mb-8">
			<img
				src={netflixState.movies[0].poster_path}
				alt={netflixState.movies[0].title}
				class="w-full h-full object-cover object-center"
			/>
			<!-- Gradient overlay matching the global background to blend in -->
			<div
				class="absolute inset-0 bg-linear-to-t from-[#141414] via-[#141414]/60 to-transparent"
			></div>

			<div class="absolute bottom-0 left-0 w-full pb-4 flex flex-col items-center gap-4">
				<div class="flex items-center gap-1 mb-1">
					<img src="/assets/icons/netflix-brand-logo.png" alt="N" class="w-3 h-4" />
					<span class="text-[10px] font-bold tracking-widest text-white/90">SERIES</span>
				</div>

				<h1
					class="text-5xl font-black text-center tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4 leading-none uppercase mb-0"
				>
					{netflixState.movies[0].title}
				</h1>

				<div
					class="text-[12px] font-medium text-white/90 drop-shadow-md tracking-wide mt-1 flex items-center justify-center gap-2"
				>
					<span>Ominous</span>
					<span class="w-1 h-1 rounded-full bg-white/50"></span>
					<span>Exciting</span>
					<span class="w-1 h-1 rounded-full bg-white/50"></span>
					<span>Teen</span>
				</div>

				<div class="flex items-center justify-center gap-10 w-full mt-2">
					<button
						class="flex flex-col items-center gap-1 bg-transparent border-none text-white hover:text-gray-300 cursor-pointer"
					>
						<Plus size={24} strokeWidth={2.5} />
						<span class="text-[11px] font-semibold">My List</span>
					</button>

					<button
						class="bg-white text-black font-bold border-none cursor-pointer py-1.5 px-6 rounded flex items-center justify-center gap-2 hover:bg-white/80 transition-colors"
						onclick={handlePlayHero}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="currentColor"><path d="M8 5v14l11-7z" /></svg
						>
						Play
					</button>

					<button
						class="flex flex-col items-center gap-1 bg-transparent border-none text-white cursor-pointer hover:text-gray-300"
						onclick={handlePlayHero}
					>
						<Info size={24} strokeWidth={2.5} />
						<span class="text-[11px] font-semibold">Info</span>
					</button>
				</div>
			</div>
		</div>
	{:else}
		<div class="relative w-full h-[550px] mb-8">
			<Skeleton width="100%" height="100%" />
			<div class="absolute bottom-0 left-0 w-full pb-6 flex flex-col items-center gap-4">
				<Skeleton width="60%" height="48px" />
				<Skeleton width="80%" height="16px" />
				<div class="flex items-center justify-center gap-8 w-full mt-2">
					<Skeleton width="32px" height="40px" />
					<Skeleton width="120px" height="40px" borderRadius="4px" />
					<Skeleton width="32px" height="40px" />
				</div>
			</div>
		</div>
	{/if}

	<div class="flex flex-col gap-6">
		<!-- Previews -->
		<div class="w-full">
			<h2 class="text-[16px] font-bold px-4 mb-2 text-white">Previews</h2>
			<div class="flex overflow-x-auto px-4 pb-2 gap-4 no-scrollbar">
				{#if previews.length === 0}
					{#each Array(5) as _, i (i)}
						<div class="flex-none w-24 h-24 rounded-full overflow-hidden bg-[#222]">
							<Skeleton width="100%" height="100%" borderRadius="50%" />
						</div>
					{/each}
				{:else}
					{#each previews as tv (tv.id)}
						<button
							data-id={tv.id}
							class="relative flex-none w-[100px] h-[100px] rounded-full overflow-hidden bg-[#222] border-2 border-[#333] focus:border-white p-0 cursor-pointer transition-transform hover:scale-105"
							onclick={handleSelectTv}
							aria-label="Preview {tv.title}"
						>
							<img
								src={tv.backdrop_path || tv.poster_path}
								alt={tv.title}
								class="w-full h-full object-cover"
								loading="lazy"
							/>
							<div
								class="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-black/80 to-transparent flex items-end justify-center pb-2"
							>
								<span
									class="text-white text-[10px] font-bold text-center leading-tight px-1 drop-shadow-md"
									>{tv.title}</span
								>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Popular on Netflix -->
		<div class="w-full">
			<h2 class="text-[16px] font-bold px-4 mb-2 text-white">Popular on Netflix</h2>
			<div class="flex overflow-x-auto px-4 pb-2 gap-2 no-scrollbar snap-x">
				{#if popular.length === 0}
					{#each Array(4) as _, i (i)}
						<div
							class="relative flex-none w-[105px] h-[155px] rounded-md overflow-hidden snap-start bg-[#222]"
						>
							<Skeleton width="100%" height="100%" />
						</div>
					{/each}
				{:else}
					{#each popular as movie (movie.id)}
						<button
							data-id={movie.id}
							class="relative flex-none w-[105px] h-[155px] rounded-md overflow-hidden bg-[#222] border-none p-0 cursor-pointer snap-start transition-transform hover:scale-105 shadow-sm"
							onclick={handleSelectMovie}
							aria-label="Watch {movie.title}"
						>
							<div class="absolute top-1 left-1 z-10 w-3 h-4">
								<img
									src="/assets/icons/netflix-brand-logo.png"
									alt="N"
									class="w-full h-full object-contain"
								/>
							</div>
							<img
								src={movie.poster_path}
								alt={movie.title}
								class="w-full h-full object-cover"
								loading="lazy"
							/>
						</button>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Trending Now -->
		<div class="w-full">
			<h2 class="text-[16px] font-bold px-4 mb-2 text-white">Trending Now</h2>
			<div class="flex overflow-x-auto px-4 pb-4 gap-2 no-scrollbar snap-x">
				{#if trending.length === 0}
					{#each Array(4) as _, i (i)}
						<div
							class="relative flex-none w-[105px] h-[155px] rounded overflow-hidden snap-start bg-[#222]"
						>
							<Skeleton width="100%" height="100%" />
						</div>
					{/each}
				{:else}
					{#each trending as tv (tv.id)}
						<button
							data-id={tv.id}
							class="relative flex-none w-[105px] h-[155px] rounded-md overflow-hidden bg-[#222] border-none p-0 cursor-pointer snap-start transition-transform hover:scale-105 shadow-sm"
							onclick={handleSelectTv}
							aria-label="View {tv.title}"
						>
							<div class="absolute top-1 left-1 z-10 w-3 h-4">
								<img
									src="/assets/icons/netflix-brand-logo.png"
									alt="N"
									class="w-full h-full object-contain"
								/>
							</div>
							<img
								src={tv.poster_path}
								alt={tv.title}
								class="w-full h-full object-cover"
								loading="lazy"
							/>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
