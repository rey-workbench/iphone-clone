<script lang="ts">
  import type { MusicAppState } from "../MusicAppState.svelte";
  import { Play, Pause, SkipForward } from "@lucide/svelte";

  let { state }: { state: MusicAppState } = $props();

  const handleShowPlayer = () => state.showPlayer = true;
  const handleKeydown = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') handleShowPlayer(); };
  const handleTogglePlay = (e: MouseEvent) => {
    e.stopPropagation();
    state.togglePlay();
  };
  const handlePlayNext = (e: MouseEvent) => {
    e.stopPropagation();
    state.playNext(1);
  };
</script>

<div
  class="flex gap-3 items-center px-3 py-2 bg-ios-bg3 border-t border-white/10 cursor-pointer text-white text-left w-full shrink-0 z-20"
  onclick={handleShowPlayer}
  onkeydown={handleKeydown}
  role="button"
  tabindex="0"
>
  <img
    src={state.current?.art || state.current?.thumbnails?.[0]?.url}
    alt={state.current?.name}
    class="w-11 h-11 rounded-md object-cover shadow-sm"
  />
  <div class="flex-1 min-w-0">
    <div class="text-[15px] truncate font-medium">{state.current?.name}</div>
    <div class="text-[12px] text-white/60 truncate">{state.current?.artist}</div>
  </div>
  <button
    class="bg-transparent border-none cursor-pointer text-white w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
    onclick={handleTogglePlay}
    aria-label="Play/Pause"
  >
    {#if state.isPlaying}
      <Pause size={24} fill="white" />
    {:else}
      <Play size={24} fill="white" />
    {/if}
  </button>
  <button
    class="bg-transparent border-none cursor-pointer text-white w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
    onclick={handlePlayNext}
    aria-label="Next"
  >
    <SkipForward size={24} fill="white" />
  </button>
</div>
