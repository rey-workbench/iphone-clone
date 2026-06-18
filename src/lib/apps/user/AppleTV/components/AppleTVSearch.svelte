<script lang="ts">
	import { appleTvState } from '../AppleTVAppState.svelte';
	import { Search, Tv } from '@lucide/svelte';

	let searchQuery = $state('');

	let filteredChannels = $derived(
		searchQuery.trim() === '' 
			? [] 
			: appleTvState.iptvChannels.filter(channel => 
				channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(channel.group && channel.group.toLowerCase().includes(searchQuery.toLowerCase()))
			)
	);
</script>

<div class="w-full h-full pb-24 pt-12 px-4 flex flex-col">
	<!-- Search Bar -->
	<div class="mb-6 shrink-0">
		<div class="relative w-full">
			<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
				<Search size={18} class="text-gray-400" />
			</div>
			<input 
				type="text" 
				bind:value={searchQuery}
				placeholder="Channels, sports, countries..."
				class="w-full bg-[#1C1C1E] text-white rounded-xl py-3 pl-11 pr-4 outline-none border border-transparent focus:border-[#333] transition-colors"
			/>
		</div>
	</div>

	<!-- Results -->
	<div class="flex-1 overflow-y-auto">
		{#if searchQuery.trim() === ''}
			<div class="flex flex-col items-center justify-center h-full text-gray-500 pb-20">
				<Search size={48} class="mb-4 opacity-30" />
				<p>Find your favorite channels</p>
			</div>
		{:else if filteredChannels.length === 0}
			<div class="flex flex-col items-center justify-center h-full text-gray-500 pb-20">
				<p>No results for "{searchQuery}"</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
				{#each filteredChannels as channel (channel.url)}
					<button 
						class="bg-[#1C1C1E] rounded-xl p-4 flex flex-col items-center justify-center gap-3 aspect-square hover:bg-[#2C2C2E] transition-colors"
						onclick={() => appleTvState.playChannel(channel)}
					>
						{#if channel.logo}
							<img src={channel.logo} alt={channel.name} class="w-16 h-16 object-contain" />
						{:else}
							<Tv size={32} class="text-gray-500" />
						{/if}
						<span class="text-sm font-medium text-white text-center line-clamp-2">{channel.name}</span>
						{#if channel.group}
							<span class="text-[10px] text-gray-400 uppercase tracking-wider">{channel.group}</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>
