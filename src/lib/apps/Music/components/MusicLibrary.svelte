<script lang="ts">
  import type { MusicState } from "../MusicState.svelte";
  import { Play, Search } from "@lucide/svelte";
  import Skeleton from "$lib/os/components/ui/Skeleton.svelte";

  let { state }: { state: MusicState } = $props();

  const handlePlay = (e: MouseEvent) => {
    const id = (e.currentTarget as HTMLElement).dataset.id;
    const t = state.tracks.find(tr => String(tr.id) === id || tr.name === id);
    if (t) state.play(t);
  };

  const handleSuggestionClick = (e: MouseEvent) => {
    state.searchQuery = (e.currentTarget as HTMLElement).dataset.sug || "";
    state.doSearch();
  };

  const handleSearchResultPlay = (e: MouseEvent) => {
    const id = (e.currentTarget as HTMLElement).dataset.id;
    const t = state.searchResults.find(tr => String(tr.id) === id || tr.name === id);
    if (t) {
      state.tracks = [...state.searchResults];
      state.play(t);
    }
  };

  const handleSearchInput = () => state.handleSearchInput();
  const handleSearchKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter") state.doSearch();
  };
</script>

{#snippet skeletonItem(i: number)}
  <div class="flex gap-3 p-2 px-3 w-full items-center">
    <Skeleton width="48px" height="48px" borderRadius="8px" class="shrink-0" />
    <div class="flex-1 min-w-0 flex flex-col gap-1">
      <Skeleton width="160px" height="18px" />
      <Skeleton width="100px" height="14px" />
    </div>
  </div>
  {#if i < 4}
    <div class="h-px bg-ios-sep ml-[68px]"></div>
  {/if}
{/snippet}

{#snippet trackItem(t: any, i: number, isSearch: boolean)}
  <button data-id={t.id || t.name} class="flex gap-3 p-2 px-3 w-full border-none bg-transparent cursor-pointer text-left text-white items-center" onclick={isSearch ? handleSearchResultPlay : handlePlay}>
    <img src={t.art} alt={t.name} class="w-12 h-12 rounded-lg object-cover shrink-0" />
    <div class="flex-1 min-w-0">
      <div class="text-[16px] truncate">{t.name}</div>
      <div class="text-[13px] text-ios-label2 truncate">{t.artist}</div>
    </div>
    <Play size={18} class="text-ios-pink" fill="currentColor" />
  </button>
  {#if i < (isSearch ? state.searchResults.length - 1 : state.tracks.length - 1)}
    <div class="h-px bg-ios-sep ml-[68px]"></div>
  {/if}
{/snippet}

<div class="flex-1 overflow-y-auto px-4 pt-[54px] pb-5">
  {#if state.activeTab === "listen_now" || state.activeTab === "browse" || state.activeTab === "radio" || state.activeTab === "library"}
    <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4 capitalize">
      {state.activeTab.replace("_", " ")}
    </h1>
    {#if state.tracks.length === 0}
      <div class="mb-5">
        <h2 class="text-[22px] font-bold text-white mb-3"><Skeleton width="120px" height="24px" /></h2>
        <div class="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          {#each Array(4) as _, i (i)}
            <div class="min-w-[150px] text-left p-0">
              <Skeleton width="150px" height="150px" borderRadius="12px" />
              <Skeleton width="120px" height="16px" class="mt-1.5" />
              <Skeleton width="90px" height="14px" class="mt-1" />
            </div>
          {/each}
        </div>
      </div>
      <div class="bg-ios-bg2 rounded-xl overflow-hidden mb-5">
        {#each Array(5) as _, i (i)}
          {@render skeletonItem(i)}
        {/each}
      </div>
    {:else}
      <div class="mb-5">
        <h2 class="text-[22px] font-bold text-white mb-3">Top Tracks</h2>
        <div class="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          {#each state.tracks.slice(0, 8) as t (t.id || t.name)}
            <button data-id={t.id || t.name} class="min-w-[150px] bg-transparent border-none cursor-pointer text-left p-0" onclick={handlePlay}>
              <img src={t.art} alt={t.name} class="w-[150px] h-[150px] rounded-xl object-cover" />
              <div class="text-[13px] font-medium text-white mt-1.5 truncate w-[150px]">{t.name}</div>
              <div class="text-[11px] text-ios-label2 truncate w-[150px]">{t.artist}</div>
            </button>
          {/each}
        </div>
      </div>
      <div class="bg-ios-bg2 rounded-xl overflow-hidden mb-5">
        {#each state.tracks as t, i (i)}
          {@render trackItem(t, i, false)}
        {/each}
      </div>
    {/if}
  {:else if state.activeTab === "search"}
    <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-2">Search</h1>
    <div class="px-1 pb-4">
      <input
        type="text"
        placeholder="Artists, Songs, Lyrics, and More"
        bind:value={state.searchQuery}
        oninput={handleSearchInput}
        onkeydown={handleSearchKeydown}
        class="w-full bg-[#1c1c1e] text-white placeholder-white/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ios-pink"
      />
    </div>
    {#if state.searchSuggestions.length > 0 && state.searchResults.length === 0 && !state.isSearching}
      <div class="px-2 mb-4 space-y-1">
        {#each state.searchSuggestions as sug, i (i)}
          <button
            data-sug={sug}
            class="w-full text-left bg-transparent border-none text-white/80 py-2 px-2 text-[15px] cursor-pointer hover:bg-white/10 rounded-lg flex items-center gap-3"
            onclick={handleSuggestionClick}
          >
            <Search size={16} class="text-white/40" />
            {sug}
          </button>
        {/each}
      </div>
    {/if}
    {#if state.isSearching}
      <div class="bg-ios-bg2 rounded-xl overflow-hidden mt-4 mb-5">
        {#each Array(5) as _, i (i)}
          {@render skeletonItem(i)}
        {/each}
      </div>
    {:else if state.searchResults.length > 0}
      <div class="bg-ios-bg2 rounded-xl overflow-hidden mb-5">
        {#each state.searchResults as t, i (i)}
          {@render trackItem(t, i, true)}
        {/each}
      </div>
    {/if}
  {:else}
    <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4 capitalize">
      {state.activeTab}
    </h1>
    <div class="text-white/50 px-2 mt-4 text-center">
      <div class="text-[17px] font-medium text-white mb-2">Coming Soon</div>
      This section is currently under development.
    </div>
  {/if}
</div>
