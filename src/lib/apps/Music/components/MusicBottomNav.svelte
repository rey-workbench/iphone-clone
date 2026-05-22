<script lang="ts">
  import type { MusicState } from "../MusicState.svelte";
  import { PlayCircle, LayoutGrid, Radio, Search } from "@lucide/svelte";

  let { state }: { state: MusicState } = $props();
</script>

<div class="flex items-center justify-between px-6 pt-3 pb-8 bg-[#1c1c1e] border-t border-white/10 w-full shrink-0 z-10">
  <button
    class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {state.activeTab === 'listen_now' ? 'text-ios-pink' : 'text-white/50 hover:text-white/80 transition-colors'}"
    onclick={() => (state.activeTab = "listen_now")}
  >
    <PlayCircle size={24} />
    <span class="text-[10px] font-medium">Listen Now</span>
  </button>
  <button
    class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {state.activeTab === 'browse' ? 'text-ios-pink' : 'text-white/50 hover:text-white/80 transition-colors'}"
    onclick={() => (state.activeTab = "browse")}
  >
    <LayoutGrid size={24} />
    <span class="text-[10px] font-medium">Browse</span>
  </button>
  <button
    class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {state.activeTab === 'radio' ? 'text-ios-pink' : 'text-white/50 hover:text-white/80 transition-colors'}"
    onclick={() => (state.activeTab = "radio")}
  >
    <Radio size={24} />
    <span class="text-[10px] font-medium">Radio</span>
  </button>
  <button
    class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {state.activeTab === 'search' ? 'text-ios-pink' : 'text-white/50 hover:text-white/80 transition-colors'}"
    onclick={() => (state.activeTab = "search")}
  >
    <Search size={24} />
    <span class="text-[10px] font-medium">Search</span>
  </button>
</div>
