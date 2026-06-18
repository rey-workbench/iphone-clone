<script lang="ts">
	import { appleTvState } from './AppleTVAppState.svelte';
	import AppleTVHome from './components/AppleTVHome.svelte';
	import AppleTVLive from './components/AppleTVLive.svelte';
	import AppleTVPlayer from './components/AppleTVPlayer.svelte';
	import AppleTVSearch from './components/AppleTVSearch.svelte';
	import { Tv, PlaySquare, ShoppingBag, ListVideo, Search } from '@lucide/svelte';

	let activeTab = $derived(appleTvState.view);

	const setTab = (tab: 'home' | 'appletvplus' | 'store' | 'library' | 'search') => {
		appleTvState.selectTab(tab);
	};

	$effect(() => {
		const handlePopState = (_e: PopStateEvent) => {
			// Handle back navigation if needed
			if (appleTvState.view !== 'home') {
				appleTvState.selectTab('home');
			}
		};
		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	});
</script>

<div class="w-full h-full bg-black text-white flex flex-col font-sans overflow-hidden">
	<!-- Active Tabs Content -->
	<div class="flex-1 relative bg-black overflow-y-auto">
		{#if appleTvState.activeChannel}
			<AppleTVPlayer />
		{:else if activeTab === 'home'}
			<AppleTVHome />
		{:else if activeTab === 'appletvplus'}
			<AppleTVLive />
		{:else if activeTab === 'search'}
			<AppleTVSearch />
		{:else}
			<div class="w-full h-full flex items-center justify-center text-gray-500">
				<p class="text-lg font-medium">{activeTab} tab coming soon</p>
			</div>
		{/if}
	</div>

	<!-- Bottom Navigation Bar -->
	{#if !appleTvState.activeChannel}
		<div class="absolute bottom-0 left-0 w-full bg-[#1C1C1E]/95 backdrop-blur-xl border-t border-[#333]/50 z-50 flex justify-around items-center pt-2 pb-8 px-2">
		<button class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer" onclick={() => setTab('home')}>
			<Tv size={22} class={activeTab === 'home' ? 'text-[#007AFF]' : 'text-gray-400'} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
			<span class="text-[10px] {activeTab === 'home' ? 'text-[#007AFF] font-medium' : 'text-gray-400'}">Home</span>
		</button>

		<button class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer" onclick={() => setTab('appletvplus')}>
			<PlaySquare size={22} class={activeTab === 'appletvplus' ? 'text-white' : 'text-gray-400'} strokeWidth={activeTab === 'appletvplus' ? 2.5 : 2} />
			<span class="text-[10px] {activeTab === 'appletvplus' ? 'text-white font-medium' : 'text-gray-400'}">Apple TV+</span>
		</button>

		<button class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer" onclick={() => setTab('store')}>
			<ShoppingBag size={22} class={activeTab === 'store' ? 'text-white' : 'text-gray-400'} strokeWidth={activeTab === 'store' ? 2.5 : 2} />
			<span class="text-[10px] {activeTab === 'store' ? 'text-white font-medium' : 'text-gray-400'}">Store</span>
		</button>

		<button class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer" onclick={() => setTab('library')}>
			<ListVideo size={22} class={activeTab === 'library' ? 'text-white' : 'text-gray-400'} strokeWidth={activeTab === 'library' ? 2.5 : 2} />
			<span class="text-[10px] {activeTab === 'library' ? 'text-white font-medium' : 'text-gray-400'}">Library</span>
		</button>

		<button class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer" onclick={() => setTab('search')}>
			<Search size={22} class={activeTab === 'search' ? 'text-white' : 'text-gray-400'} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
			<span class="text-[10px] {activeTab === 'search' ? 'text-white font-medium' : 'text-gray-400'}">Search</span>
		</button>
	</div>
	{/if}
</div>
