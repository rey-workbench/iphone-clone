<script lang="ts">
  import { netflixState } from "../NetflixState.svelte";
  import Skeleton from "$lib/os/components/ui/Skeleton.svelte";
  import MovieEpisodes from "./MovieEpisodes.svelte";

  let {
    media,
    isTvShow,
    title,
    currentServer,
    onPlay,
    onSetServer,
    selectedSeason = $bindable(),
    selectedEpisode = $bindable(),
    isPlaying = $bindable()
  } = $props<{
    media: any;
    isTvShow: boolean;
    title: string;
    currentServer: number;
    onPlay: () => void;
    onSetServer: (e: MouseEvent) => void;
    selectedSeason: number;
    selectedEpisode: number;
    isPlaying: boolean;
  }>();
</script>

<!-- Content Details -->
<div class="px-3 pt-2 flex flex-col gap-3 pb-12">
  <!-- N + Tag -->
  <div class="flex items-center gap-1">
    <img
      src="/assets/icons/netflix-brand-logo.png"
      alt="N"
      class="h-4 w-auto object-contain"
    />
    <span class="text-[10px] tracking-[0.2em] font-medium text-gray-300"
      >{isTvShow ? "SERIES" : "FILM"}</span
    >
  </div>

  <!-- Title -->
  <h1 class="text-2xl font-bold leading-tight">{title}</h1>

  <!-- Meta -->
  <div class="flex items-center gap-2 text-xs text-gray-400 font-medium">
    {#if media.vote_average}
      <span class="text-green-500 font-bold"
        >{Math.round(media.vote_average * 10)}% Match</span
      >
    {/if}
    <span>2024</span>
    <span class="px-1 py-0.5 bg-[#333] text-gray-300 rounded-sm text-[10px]"
      >TV-MA</span
    >
    {#if isTvShow}<span>{netflixState.details.seasons.length > 0 ? netflixState.details.seasons.length : media.seasons || 1} Seasons</span>{/if}
    <span class="border border-gray-500 px-1 rounded-sm text-[10px]"
      >HD</span
    >
    <span class="border border-gray-500 px-1 rounded-sm text-[10px]"
      >AD</span
    >
  </div>

  <!-- Play & Download -->
  <div class="flex flex-col gap-2 mt-1">
    <button
      type="button"
      class="w-full bg-white text-black font-bold py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
      onclick={onPlay}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"><path d="M8 5v14l11-7z" /></svg
      >
      Play
    </button>
    <button
      type="button"
      class="w-full bg-[#2b2b2b] text-white font-bold py-2 rounded flex items-center justify-center gap-2 hover:bg-[#333] transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
          points="7 10 12 15 17 10"
        /><line x1="12" x2="12" y1="15" y2="3" /></svg
      >
      Download
    </button>
  </div>

  <!-- Server Switcher -->
  <div
    class="flex items-center gap-2 mt-2 mb-1 overflow-x-auto no-scrollbar"
  >
    <span class="text-xs text-gray-400 font-medium whitespace-nowrap"
      >Server:</span
    >
    {#each [1, 2, 3] as server (server)}
      <button
        type="button"
        data-server={server}
        class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors {currentServer ===
        server
          ? 'bg-white text-black'
          : 'bg-[#333] text-gray-300 hover:bg-[#444]'}"
        onclick={onSetServer}
      >
        {server === 1 ? "Vidsrc" : server === 2 ? "VidLink" : "MultiEmbed"}
      </button>
    {/each}
  </div>

  <!-- Synopsis -->
  <div class="text-sm leading-snug text-white mt-1">
    <span class="font-bold">{isTvShow ? "S1:E1 " : ""}</span>
    {#if netflixState.details.isLoading}
      <div class="flex flex-col gap-1 mt-1">
        <Skeleton width="100%" height="14px" />
        <Skeleton width="90%" height="14px" />
        <Skeleton width="40%" height="14px" />
      </div>
    {:else}
      {media.overview || "No synopsis available. Tap Play to start watching."}
    {/if}
  </div>

  <!-- Cast -->
  <div class="text-[11px] text-gray-400 leading-tight">
    <span class="text-gray-300">Starring:</span>
    {#if netflixState.details.isLoading}
      <Skeleton width="120px" height="12px" class="inline-block" />
    {:else}
      {netflixState.details.cast}
    {/if}
    <br />
    <span class="text-gray-300">{isTvShow ? "Creator:" : "Director:"}</span>
    {#if netflixState.details.isLoading}
      <Skeleton width="80px" height="12px" class="inline-block" />
    {:else}
      {netflixState.details.creator}
    {/if}
  </div>

  <!-- Actions: My List, Rate, Share -->
  <div class="flex items-center gap-8 mt-2 px-4">
    {#each [{ label: "My List", icon: "M12 5v14M5 12h14" }, { label: "Rate", icon: "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" }, { label: "Share", icon: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" }] as action (action.label)}
      <button
        type="button"
        class="flex flex-col items-center gap-1 cursor-pointer text-gray-300 hover:text-white bg-transparent border-none p-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d={action.icon} />
        </svg>
        <span class="text-[10px]">{action.label}</span>
      </button>
    {/each}
  </div>

  <!-- Tabs -->
  <div
    class="flex items-center gap-6 border-t border-t-[#333] mt-4 pt-4 text-sm font-bold"
  >
    {#if isTvShow}
      <div class="border-t-4 border-red-600 pt-2 -mt-5 text-white">
        Episodes
      </div>
      <div class="text-gray-400 pt-2 -mt-5">Collection</div>
      <div class="text-gray-400 pt-2 -mt-5">More Like This</div>
    {:else}
      <div class="border-t-4 border-red-600 pt-2 -mt-5 text-white">
        More Like This
      </div>
      <div class="text-gray-400 pt-2 -mt-5">Collection</div>
    {/if}
  </div>

  <!-- Episodes for TV -->
  {#if isTvShow && netflixState.details.seasons.length > 0}
    <MovieEpisodes {media} bind:selectedSeason bind:selectedEpisode bind:isPlaying />
  {/if}
</div>
