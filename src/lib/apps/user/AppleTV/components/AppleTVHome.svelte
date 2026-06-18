<script lang="ts">
	import { appleTvState } from '../AppleTVAppState.svelte';
	import { ChevronRight } from '@lucide/svelte';
</script>

<div class="w-full min-h-full pb-24 pt-12">
	<!-- Top Bar -->
	<div class="px-4 mb-6 flex items-center justify-center">
		<h1 class="text-[17px] font-semibold text-white">Home</h1>
	</div>

	<!-- Top Chart Section -->
	<div class="mb-8">
		<div class="px-4 flex items-center justify-between mb-4">
			<h2 class="text-[20px] font-bold text-white flex items-center gap-1">
				Top Chart: Apple TV+
				<ChevronRight size={20} class="text-gray-400" />
			</h2>
		</div>
		
		<div class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar px-4 gap-4 pb-4">
			{#each appleTvState.topChart as item (item.id)}
				<div class="flex-none w-[280px] snap-center">
					<div class="relative w-full aspect-video rounded-xl overflow-hidden mb-2">
						<img src={item.poster} alt={item.title} class="w-full h-full object-cover" />
					</div>
					<div class="flex items-start gap-2">
						<span class="text-4xl font-bold text-gray-500 w-8">{item.rank}</span>
						<div>
							<h3 class="text-[15px] font-medium text-white leading-tight">{item.title}</h3>
							<p class="text-[13px] text-gray-400">{item.genre}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Channels & Apps Section -->
	<div class="mb-8">
		<div class="px-4 mb-4">
			<h2 class="text-[20px] font-bold text-white">Channels & Apps</h2>
		</div>
		<div class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar px-4 gap-4 pb-2">
			{#each appleTvState.channels as channel (channel.id)}
				<div class="flex-none w-[120px] snap-center">
					<div class="{channel.bgClass} w-full aspect-3/4 rounded-xl flex flex-col items-center justify-center p-4">
						{#if channel.logo}
							<img src={channel.logo} alt={channel.name} class="w-16 h-16 object-contain" />
						{:else}
							<span class="text-white font-bold text-center">{channel.name}</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Now on Apple TV+ Section -->
	<div class="mb-8">
		<div class="px-4 flex items-center justify-between mb-4">
			<h2 class="text-[20px] font-bold text-white flex items-center gap-1">
				Now on Apple TV+
				<ChevronRight size={20} class="text-gray-400" />
			</h2>
		</div>
		<div class="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar px-4 gap-4 pb-2">
			{#each appleTvState.nowOnTvPlus as item (item.id)}
				<div class="flex-none w-[280px] snap-center">
					<div class="relative w-full aspect-video rounded-xl overflow-hidden mb-2">
						<img src={item.poster} alt={item.title} class="w-full h-full object-cover" />
					</div>
					<h3 class="text-[15px] font-medium text-white mt-1 px-1">{item.title}</h3>
				</div>
			{/each}
		</div>
	</div>
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
