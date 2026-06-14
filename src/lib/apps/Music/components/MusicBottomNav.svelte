<script lang="ts">
  import type { MusicAppState } from "../MusicAppState.svelte";
  import { PlayCircle, LayoutGrid, Radio, Search } from "@lucide/svelte";

  const { state }: { state: MusicAppState } = $props();

  const setTabListenNow = () => state.activeTab = "listen_now";
  const setTabBrowse = () => state.activeTab = "browse";
  const setTabRadio = () => state.activeTab = "radio";
  const setTabSearch = () => state.activeTab = "search";
</script>

<div class="flex items-center justify-between px-6 pt-3 pb-8 bg-ios-bg2 border-t border-white/10 w-full shrink-0 z-10">
  <button
    class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors"
    class:text-ios-pink={state.activeTab === 'listen_now'}
    class:text-white_50={state.activeTab !== 'listen_now'}
    class:hover:text-white_80={state.activeTab !== 'listen_now'}
    onclick={setTabListenNow}
  >
    <PlayCircle size={24} />
    <span class="text-[10px] font-medium">Listen Now</span>
  </button>
  <button
    class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors"
    class:text-ios-pink={state.activeTab === 'browse'}
    class:text-white_50={state.activeTab !== 'browse'}
    class:hover:text-white_80={state.activeTab !== 'browse'}
    onclick={setTabBrowse}
  >
    <LayoutGrid size={24} />
    <span class="text-[10px] font-medium">Browse</span>
  </button>
  <button
    class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors"
    class:text-ios-pink={state.activeTab === 'radio'}
    class:text-white_50={state.activeTab !== 'radio'}
    class:hover:text-white_80={state.activeTab !== 'radio'}
    onclick={setTabRadio}
  >
    <Radio size={24} />
    <span class="text-[10px] font-medium">Radio</span>
  </button>
  <button
    class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer transition-colors"
    class:text-ios-pink={state.activeTab === 'search'}
    class:text-white_50={state.activeTab !== 'search'}
    class:hover:text-white_80={state.activeTab !== 'search'}
    onclick={setTabSearch}
  >
    <Search size={24} />
    <span class="text-[10px] font-medium">Search</span>
  </button>
</div>
