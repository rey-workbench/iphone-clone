<script lang="ts">
	import { netflixState } from '../NetflixAppState.svelte';
	import type { INetflixMedia } from '$lib/types';

	let { searchQuery = $bindable(''), searchResults = [] } = $props<{
		searchQuery: string;
		searchResults: INetflixMedia[];
	}>();

	const handleSelectSearchItem = (e: MouseEvent) => {
		const id = (e.currentTarget as HTMLElement).dataset.id;
		if (id) {
			const item = searchResults.find((m: INetflixMedia) => String(m.id) === id);
			if (item) netflixState.selectMedia(item);
		}
	};

	const handleClearSearch = () => (searchQuery = '');
</script>

<div class="flex flex-col h-full bg-black pt-12">
	<div class="px-4 pb-4">
		<div class="flex items-center bg-[#333] rounded overflow-hidden">
			<div class="pl-3 py-2 text-gray-400">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
				>
			</div>
			<input
				type="text"
				placeholder="Search"
				class="w-full bg-transparent border-none outline-none text-white px-2 py-2 text-sm"
				bind:value={searchQuery}
			/>
			{#if searchQuery}
				<button
					class="pr-3 py-2 text-gray-400 border-none bg-transparent cursor-pointer"
					aria-label="Clear Search"
					onclick={handleClearSearch}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg
					>
				</button>
			{/if}
		</div>
	</div>

	<div class="flex-1 overflow-y-auto no-scrollbar pb-20">
		{#if searchQuery === ''}
			<h2 class="text-xl font-bold px-4 mb-4 mt-2">Movies & TV</h2>
			<div class="flex flex-col">
				{#each searchResults as item (item.id || item)}
					<button
						data-id={item.id}
						class="flex items-center gap-3 w-full bg-[#111] hover:bg-[#222] transition-colors mb-0.5 relative group border-none p-0 cursor-pointer"
						onclick={handleSelectSearchItem}
						aria-label="View {item.title}"
					>
						<div class="w-35 h-18.75 shrink-0 relative">
							<img
								src={item.backdrop_path || item.poster_path}
								alt={item.title}
								class="w-full h-full object-cover"
							/>
							<div class="absolute top-1 left-1 z-10 w-2 h-3">
								<img
									src="/assets/icons/netflix-brand-logo.png"
									alt="N"
									class="w-full h-full object-contain"
								/>
							</div>
						</div>
						<div class="flex-1 text-left">
							<h3 class="text-sm font-semibold text-gray-200">
								{item.title}
							</h3>
						</div>
						<div class="pr-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="28"
								height="28"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="text-white"
								><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg
							>
						</div>
					</button>
				{/each}
			</div>
		{:else}
			<h2 class="text-xl font-bold px-4 mb-4 mt-2">Movies & TV</h2>
			<div class="grid grid-cols-3 gap-2 px-2">
				{#each searchResults as item (item.id || item)}
					<button
						data-id={item.id}
						class="w-full aspect-2/3 relative rounded overflow-hidden border-none p-0 cursor-pointer"
						onclick={handleSelectSearchItem}
					>
						<img src={item.poster_path} alt={item.title} class="w-full h-full object-cover" />
						<div class="absolute top-1 left-1 z-10 w-2 h-3">
							<img
								src="/assets/icons/netflix-brand-logo.png"
								alt="N"
								class="w-full h-full object-contain"
							/>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
