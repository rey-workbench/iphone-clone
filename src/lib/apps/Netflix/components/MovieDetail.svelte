<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { netflixState } from "../NetflixState.svelte";
  import { ApiConfig } from "$lib/config/api";

  let media = $derived(netflixState.selectedMedia);
  let isTvShow = $derived(
    media?.media_type === "tv" || media?.title === undefined,
  );
  let title = $derived(media?.title || media?.name || "Unknown Title");

  let isPlaying = $state(false);
  let isFullscreen = $state(false);
  let selectedSeason = $state(1);
  let selectedEpisode = $state(1);

  let cast = $state("Loading...");
  let creator = $state("Loading...");
  let trailerId = $state<string | null>(null);
  let showTrailer = $state(false);
  let seasons = $state<any[]>([]);
  let idleTimer: any;
  let currentServer = $state(1);

  let iframeSrc = $derived(
    isTvShow
      ? ApiConfig.getNetflixTvStream(
          media?.id || "",
          selectedSeason,
          selectedEpisode,
          currentServer,
        )
      : ApiConfig.getNetflixMovieStream(media?.id || "", currentServer),
  );

  function openFullscreen() {
    isFullscreen = true;
  }
  function closeFullscreen() {
    isFullscreen = false;
  }
  function closePlayer() {
    isPlaying = false;
    isFullscreen = false;
  }

  async function fetchDetails() {
    if (!media?.id) return;
    try {
      const type = isTvShow ? "tv" : "movie";
      const res = await fetch(
        `/api/netflix/details?id=${media.id}&type=${type}`,
      );
      const data = await res.json();
      if (!data.error) {
        cast = data.cast || "Unknown";
        creator = data.creator || "Unknown";
        trailerId = data.trailerId;
        if (data.seasons && data.seasons.length > 0) {
          seasons = data.seasons;
          selectedSeason = seasons[0].season_number;
        } else {
          seasons = [];
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  onMount(() => {
    fetchDetails();
    // Block malicious framebusting redirects unconditionally
    const preventRedirect = (e: BeforeUnloadEvent) => {
      if (isPlaying) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };
    window.addEventListener("beforeunload", preventRedirect);
    
    return () => {
      window.removeEventListener("beforeunload", preventRedirect);
    };
  });

  function startIdleTimer() {
    clearTimeout(idleTimer);
    showTrailer = false;
    idleTimer = setTimeout(() => {
      if (!isPlaying && trailerId) {
        showTrailer = true;
      }
    }, 4000); // 4 seconds of idle time
  }

  $effect(() => {
    if (media) {
      cast = "Loading...";
      creator = "Loading...";
      trailerId = null;
      showTrailer = false;
      fetchDetails().then(() => {
        startIdleTimer();
      });
    }
  });

  onDestroy(() => {
    clearTimeout(idleTimer);
  });
</script>

<!-- Fullscreen Landscape Overlay — rendered outside scroll container -->
{#if isPlaying && isFullscreen}
  <div
    class="fixed z-99999 bg-black"
    style="top:0;left:0;width:100vh;height:100vw;transform-origin:top left;transform:rotate(90deg) translateY(-100%);"
  >
    {#key `${isTvShow}-${selectedSeason}-${selectedEpisode}-fs`}
      <iframe
        src={iframeSrc}
        class="w-full h-full pointer-events-auto"
        style="width: 100%; height: 100%;"
        frameborder="0"
        referrerpolicy="origin"
        allowfullscreen
      ></iframe>
    {/key}
    <!-- Exit Fullscreen Button -->
    <button
      type="button"
      class="absolute top-4 right-4 z-9 text-white bg-black/70 rounded-full p-2 hover:bg-black/90"
      onclick={closeFullscreen}
      aria-label="Exit Fullscreen"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        width="22"
        height="22"
      >
        <path
          d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
        />
      </svg>
    </button>
  </div>
{/if}

<!-- Main Detail Page -->
<div
  class="w-full h-full bg-black text-white flex flex-col font-sans overflow-y-auto no-scrollbar pb-20 pt-[54px]"
>
  <!-- Header (Safe Area) -->
  <div
    class="flex justify-between items-center px-4 mb-4 shrink-0 pointer-events-none"
  >
    <button
      type="button"
      aria-label="Back"
      class="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors pointer-events-auto"
      onclick={() => netflixState.goBack()}
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
        stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg
      >
    </button>
    {#if !isPlaying}
      <button
        type="button"
        aria-label="Cast"
        class="w-8 h-8 flex items-center justify-center text-white bg-black/40 rounded-full backdrop-blur-md pointer-events-auto hover:bg-black/70 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><rect width="20" height="15" x="2" y="7" rx="2" ry="2" /><path
            d="M17 7V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2"
          /></svg
        >
      </button>
    {/if}
  </div>

  {#if media}
    <!-- Media Player & Thumbnail Container -->
    <div class="relative w-full aspect-video bg-black shrink-0 overflow-hidden">
      <!-- Iframe always running in background to burn through the "Ad-Free" countdown -->
      {#key `${isTvShow}-${selectedSeason}-${selectedEpisode}`}
        <iframe
          src={iframeSrc}
          class="absolute inset-0 w-full h-full z-20"
          style="width: 100%; height: 100%;"
          frameborder="0"
          referrerpolicy="origin"
          allowfullscreen
        ></iframe>
      {/key}

      <!-- Hero Thumbnail Overlay (Hides Iframe until Play is clicked) -->
      {#if !isPlaying}
        <div
          class="absolute inset-0 w-full h-full bg-black z-10 animate-[fadeIn_0.3s_ease]"
        >
          <!-- Background Image or Trailer -->
          {#if showTrailer && trailerId}
            <iframe
              src="https://www.youtube.com/embed/{trailerId}?autoplay=1&mute=1&controls=0&playsinline=1&modestbranding=1&loop=1&playlist={trailerId}"
              class="w-full h-full object-cover scale-[1.35] pointer-events-none opacity-80"
              frameborder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              title="Trailer"
            ></iframe>
          {:else}
            <div
              class="w-full h-full bg-cover bg-center transition-opacity duration-500"
              style="background-image: url({media.backdrop_path ||
                media.poster_path})"
            ></div>

            <!-- Play button overlay (Only visible when trailer hasn't started) -->
            <div
              class="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none"
            >
              <div
                class="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center bg-black/40"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="white"
                  class="ml-1"><path d="M8 5v14l11-7z" /></svg
                >
              </div>
            </div>
          {/if}

          <div
            class="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent pointer-events-none"
          ></div>
        </div>
      {/if}
    </div>

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
        {#if isTvShow}<span>{media.seasons || 1} Seasons</span>{/if}
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
          onclick={() => (isPlaying = true)}
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
        {#each [1, 2, 3] as server}
          <button
            type="button"
            class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors {currentServer ===
            server
              ? 'bg-white text-black'
              : 'bg-[#333] text-gray-300 hover:bg-[#444]'}"
            onclick={() => (currentServer = server)}
          >
            {server === 1 ? "Vidsrc" : server === 2 ? "VidLink" : "MultiEmbed"}
          </button>
        {/each}
      </div>

      <!-- Synopsis -->
      <p class="text-sm leading-snug text-white mt-1">
        <span class="font-bold">{isTvShow ? "S1:E1 " : ""}</span>
        {media.overview || "No synopsis available. Tap Play to start watching."}
      </p>

      <!-- Cast -->
      <p class="text-[11px] text-gray-400 leading-tight">
        <span class="text-gray-300">Starring:</span>
        {cast}<br />
        <span class="text-gray-300">{isTvShow ? "Creator:" : "Director:"}</span>
        {creator}
      </p>

      <!-- Actions: My List, Rate, Share -->
      <div class="flex items-center gap-8 mt-2 px-4">
        {#each [{ label: "My List", icon: "M12 5v14M5 12h14" }, { label: "Rate", icon: "M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" }, { label: "Share", icon: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" }] as action}
          <div
            class="flex flex-col items-center gap-1 cursor-pointer text-gray-300 hover:text-white"
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
          </div>
        {/each}
      </div>

      <!-- Tabs -->
      <div
        class="flex items-center gap-6 border-t border-t-[#333] mt-4 pt-4 text-sm font-bold"
      >
        {#if isTvShow}
          <div class="border-t-4 border-red-600 pt-2 mt-[-20px] text-white">
            Episodes
          </div>
          <div class="text-gray-400 pt-2 mt-[-20px]">Collection</div>
          <div class="text-gray-400 pt-2 mt-[-20px]">More Like This</div>
        {:else}
          <div class="border-t-4 border-red-600 pt-2 mt-[-20px] text-white">
            More Like This
          </div>
          <div class="text-gray-400 pt-2 mt-[-20px]">Collection</div>
        {/if}
      </div>

      <!-- Episodes for TV -->
      {#if isTvShow && seasons.length > 0}
        <div class="mt-2">
          <select
            id="season-select"
            aria-label="Select Season"
            class="bg-[#2b2b2b] text-white px-4 py-2 rounded text-sm font-medium border-none outline-none mb-4"
            bind:value={selectedSeason}
          >
            {#each seasons as s}
              <option value={s.season_number}>{s.name}</option>
            {/each}
          </select>
          <div class="flex flex-col gap-6">
            {#each Array.from( { length: seasons.find((s) => s.season_number === selectedSeason)?.episode_count || 1 }, ) as _, i}
              <div class="flex flex-col gap-2">
                <div
                  class="flex items-center gap-3 cursor-pointer group"
                  role="button"
                  tabindex="0"
                  onclick={() => {
                    selectedEpisode = i + 1;
                    isPlaying = true;
                  }}
                  onkeydown={(e) =>
                    e.key === "Enter" &&
                    ((selectedEpisode = i + 1), (isPlaying = true))}
                >
                  <div
                    class="relative w-[130px] h-[75px] shrink-0 bg-[#2b2b2b] rounded flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={media.backdrop_path}
                      alt="Episode {i + 1}"
                      class="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    {#if selectedEpisode === i + 1 && isPlaying}
                      <div class="text-xs font-bold text-red-600 z-10">
                        Playing
                      </div>
                    {:else}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="white"
                        class="z-10 group-hover:scale-110 transition-transform"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="white"
                          stroke-width="1"
                          fill="rgba(0,0,0,0.5)"
                        />
                        <path d="M10 8l6 4-6 4V8z" />
                      </svg>
                    {/if}
                  </div>
                  <div class="flex flex-col flex-1">
                    <div class="flex justify-between items-center mb-1">
                      <div class="text-sm text-white font-medium">
                        Episode {i + 1}
                      </div>
                    </div>
                  </div>
                </div>
                <p class="text-[13px] text-gray-400 leading-snug">
                  {media.overview
                    ? media.overview.substring(0, 100) + "..."
                    : "An exciting episode full of twists and turns."}
                </p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
