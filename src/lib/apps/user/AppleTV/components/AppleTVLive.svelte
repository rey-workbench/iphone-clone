<script lang="ts">
	import { appleTvState } from '../AppleTVAppState.svelte';
	import { Tv, ChevronRight } from '@lucide/svelte';

	let groupedChannels = $derived((() => {
		const groups: Record<string, typeof appleTvState.iptvChannels> = {};
		for (const channel of appleTvState.iptvChannels) {
			const groupName = channel.group || 'General';
			if (!groups[groupName]) {
				groups[groupName] = [];
			}
			groups[groupName].push(channel);
		}
		return Object.entries(groups).map(([name, channels]) => ({
			name,
			channels
		})).sort((a, b) => a.name.localeCompare(b.name));
	})());
</script>

<div class="w-full min-h-full pb-24 pt-12">
	<!-- Top Bar -->
	<div class="px-4 mb-6 flex items-center justify-center">
		<h1 class="text-[17px] font-semibold text-white">Live TV</h1>
	</div>

	{#if appleTvState.isIptvLoading}
		<div class="flex items-center justify-center py-20">
			<div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#007AFF]"></div>
		</div>
	{:else if appleTvState.iptvChannels.length === 0}
		<div class="flex flex-col items-center justify-center py-20 text-gray-400">
			<Tv size={48} class="mb-4 opacity-50" />
			<p>No channels available</p>
		</div>
	{:else}
		{#each groupedChannels as group (group.name)}
			<div class="mb-8">
				<div class="px-4 flex items-center justify-between mb-4">
					<h2 class="text-[20px] font-bold text-white flex items-center gap-1">
						{group.name}
						<ChevronRight size={20} class="text-gray-400" />
					</h2>
				</div>
				<div class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar px-4 gap-4 pb-2">
					{#each group.channels as channel (channel.url)}
						<button 
							class="flex-none w-[130px] snap-center bg-[#1C1C1E] rounded-xl flex flex-col items-center justify-center p-4 aspect-4/5 hover:bg-[#2C2C2E] transition-colors gap-3"
							onclick={() => appleTvState.playChannel(channel)}
						>
							{#if channel.logo}
								<img src={channel.logo} alt={channel.name} class="w-16 h-16 object-contain" />
							{:else}
								<Tv size={32} class="text-gray-500" />
							{/if}
							<span class="text-[13px] font-bold text-white text-center line-clamp-2 leading-tight">{channel.name}</span>
						</button>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
