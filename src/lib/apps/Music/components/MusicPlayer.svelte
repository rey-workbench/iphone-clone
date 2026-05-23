<script lang="ts">
  import type { MusicState } from "../MusicState.svelte";
  import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume1,
    Volume2,
    MoreHorizontal,
    MessageSquareQuote,
    Airplay,
    ListMusic,
    Loader2,
    ChevronDown,
  } from "@lucide/svelte";

  let { state }: { state: MusicState } = $props();

  function formatTime(seconds: number, isRemaining = false) {
    if (!seconds || isNaN(seconds)) return isRemaining ? "-00:00" : "00:00";
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = Math.floor(absSeconds % 60);
    const formatted = `${m}:${s < 10 ? "0" : ""}${s}`;
    return isRemaining ? `-${formatted}` : formatted;
  }

  function handleSeek(e: MouseEvent) {
    if (!state.player || typeof state.player.getDuration !== "function") return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * state.player.getDuration();
    state.player.seekTo(newTime, true);
    state.progress = pos * 100;
  }

  function handleVolume(e: MouseEvent) {
    if (!state.player || typeof state.player.setVolume !== "function") return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    state.volume = pos * 100;
    state.player.setVolume(state.volume);
  }
</script>

<!-- Background Blur -->
<div class="absolute inset-0 z-10 bg-black">
  <img
    src={state.current?.art || state.current?.thumbnails?.[0]?.url}
    alt="bg"
    class="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl saturate-150 transform scale-110"
  />
  <div class="absolute inset-0 bg-black/40"></div>

  <!-- Header -->
  <div class="relative flex justify-between items-center px-6 pt-12 pb-4">
    <button
      class="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full backdrop-blur-md hover:bg-white/20 transition-all cursor-pointer"
      onclick={() => (state.showPlayer = false)}
    >
      <ChevronDown class="w-6 h-6 text-white" />
    </button>
    <div class="flex flex-col items-center">
      <span
        class="text-[11px] font-medium tracking-widest text-white/50 uppercase"
        >PLAYING FROM</span
      >
      <span class="text-[13px] font-semibold text-white truncate max-w-[200px]">
        {state.current?.album || state.current?.name || "Music"}
      </span>
    </div>
    <div class="w-10"></div>
  </div>
</div>

<!-- Player Content -->
<div class="absolute inset-0 z-20 flex flex-col px-6 pt-24 pb-8">
  {#if state.showLyrics}
    <div
      class="flex-1 overflow-y-auto mb-10 w-full px-6 text-white text-[24px] font-bold leading-normal hide-scrollbar scroll-smooth"
    >
      {#if state.isFetchingLyrics}
        <div class="flex justify-center py-20">
          <Loader2 class="animate-spin text-white/50" size={32} />
        </div>
      {:else if state.isSynced && state.parsedLyrics.length > 0}
        <div class="space-y-6 py-[40vh]">
          {#each state.parsedLyrics as line, i}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <p
              class="transition-all duration-300 ease-out cursor-pointer {i ===
              state.activeLyricIndex
                ? 'text-white opacity-100 active-lyric'
                : 'text-white opacity-40 blur-[0.5px]'}"
              onclick={() => {
                if (state.player && typeof state.player.seekTo === "function")
                  state.player.seekTo(line.time, true);
              }}
            >
              {line.text || "♪"}
            </p>
          {/each}
        </div>
      {:else}
        <div
          class="whitespace-pre-wrap py-[10vh] text-[20px] font-semibold text-white/60 text-center leading-relaxed"
        >
          <span
            class="text-xs font-normal text-white/30 uppercase tracking-widest mb-6 block"
            >Synced lyrics unavailable</span
          >
          {state.lyricsText}
        </div>
      {/if}
    </div>
  {:else}
    <img
      src={state.current?.art}
      alt={state.current?.name}
      class="w-full aspect-square rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] object-cover mb-12"
    />
  {/if}

  <div class="w-full flex-1 flex flex-col">
    <div class="w-full flex justify-between items-center mb-8">
      <div class="flex-1 min-w-0 pr-4">
        <div class="font-bold text-white text-[22px] truncate">
          {state.current?.name}
        </div>
        <div class="text-white/70 text-[18px] truncate mt-0.5">
          {state.current?.artist}
        </div>
      </div>
      <button
        class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 border-none cursor-pointer"
      >
        <MoreHorizontal size={18} />
      </button>
    </div>

    <!-- Progress -->
    <div class="w-full mb-10">
      <div
        class="w-full h-1.5 bg-white/20 rounded-full relative cursor-pointer"
        onclick={handleSeek}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleSeek(e as any);
        }}
        role="slider"
        aria-valuenow={state.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        tabindex="0"
      >
        <div
          class="absolute top-0 left-0 h-full bg-white rounded-full transition-[width] duration-200"
          style="width:{state.progress}%"
        ></div>
        <div
          class="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md scale-[1.5] pointer-events-none"
          style="left: calc({state.progress}% - 4px)"
        ></div>
      </div>
      <div
        class="flex justify-between mt-2.5 text-[11px] text-white/60 font-medium pointer-events-none"
      >
        <span
          >{formatTime(
            (state.progress / 100) *
              (typeof state.player?.getDuration === "function"
                ? state.player.getDuration()
                : 0),
          )}</span
        >
        <span
          >{formatTime(
            (typeof state.player?.getDuration === "function"
              ? state.player.getDuration()
              : 0) -
              (state.progress / 100) *
                (typeof state.player?.getDuration === "function"
                  ? state.player.getDuration()
                  : 0),
            true,
          )}</span
        >
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-between px-6 mb-12">
      <button
        class="bg-transparent border-none cursor-pointer text-white hover:scale-110 transition-transform active:scale-95"
        onclick={() => state.playNext(-1)}
      >
        <SkipBack size={44} fill="white" />
      </button>
      <button
        class="bg-transparent border-none cursor-pointer flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95"
        onclick={() => state.togglePlay()}
      >
        {#if state.isPlaying}
          <Pause size={56} fill="white" />
        {:else}
          <Play size={56} fill="white" />
        {/if}
      </button>
      <button
        class="bg-transparent border-none cursor-pointer text-white hover:scale-110 transition-transform active:scale-95"
        onclick={() => state.playNext(1)}
      >
        <SkipForward size={44} fill="white" />
      </button>
    </div>

    <!-- Volume -->
    <div class="flex items-center gap-3 text-white/50 mb-10">
      <Volume1 size={14} />
      <div
        class="flex-1 h-1.5 bg-white/20 rounded-full relative cursor-pointer"
        onclick={handleVolume}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleVolume(e as any);
        }}
        role="slider"
        aria-valuenow={state.volume}
        aria-valuemin={0}
        aria-valuemax={100}
        tabindex="0"
      >
        <div
          class="absolute top-0 left-0 h-full bg-white rounded-full pointer-events-none"
          style="width: {state.volume}%"
        ></div>
        <div
          class="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md scale-[1.5] pointer-events-none"
          style="left: calc({state.volume}% - 4px)"
        ></div>
      </div>
      <Volume2 size={20} />
    </div>

    <!-- Bottom Actions -->
    <div class="flex items-center justify-evenly text-white/70 px-4 mt-auto">
      <button
        class="bg-transparent border-none cursor-pointer {state.showLyrics
          ? 'text-ios-pink'
          : 'text-current hover:text-white'}"
        onclick={() => state.fetchLyrics()}
      >
        <MessageSquareQuote size={20} />
      </button>
      <button
        class="bg-transparent border-none text-current cursor-pointer hover:text-white"
        ><Airplay size={20} /></button
      >
      <button
        class="bg-transparent border-none text-current cursor-pointer hover:text-white active:text-ios-pink"
        onclick={() => state.fetchUpNext()}><ListMusic size={22} /></button
      >
    </div>
  </div>
</div>
