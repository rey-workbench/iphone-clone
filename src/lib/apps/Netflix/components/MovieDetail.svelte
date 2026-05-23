<script lang="ts">
  import { netflixState } from "../NetflixState.svelte";
  
  let media = $derived(netflixState.selectedMedia);
  let isTvShow = $derived(media?.media_type === 'tv' || media?.title === undefined);
  let title = $derived(media?.title || media?.name || "Unknown");
  
  // State for TV Series
  let selectedSeason = $state(1);
</script>

<div class="w-full h-full bg-[#000000] text-white flex flex-col overflow-y-auto relative animate-[fadeIn_0.3s_ease]">
  
  <!-- Back Button (Floating on Top) -->
  <div class="absolute top-12 left-4 right-4 z-20 flex justify-between items-center">
    <button 
      aria-label="Back"
      class="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border-none hover:bg-black/70 transition-colors"
      onclick={() => netflixState.goBack()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <div class="flex gap-4">
      <!-- Cast Icon placeholder -->
      <button aria-label="Cast" class="w-8 h-8 flex items-center justify-center text-white bg-black/40 rounded-full backdrop-blur-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><path d="M17 7V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2"/></svg>
      </button>
    </div>
  </div>

  {#if media}
    <!-- Hero / Trailer Video Placeholder -->
    <div 
      class="relative w-full h-[250px] shrink-0 bg-cover bg-center cursor-pointer group"
      style="background-image: url({media.backdrop_path || media.poster_path})"
      role="button"
      tabindex="0"
      aria-label="Play Trailer"
      onclick={() => netflixState.playMedia()}
      onkeydown={(e) => e.key === 'Enter' && netflixState.playMedia()}
    >
      <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
        <!-- Big Play Button Overlay -->
        <div class="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center bg-black/40 group-hover:bg-white/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" class="ml-1"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-linear-to-t from-[#000000] via-transparent to-transparent"></div>
    </div>

    <!-- Content Details -->
    <div class="px-3 pt-2 relative z-10 flex flex-col gap-3 pb-12">
      <!-- Netflix Series / Film Tag -->
      <div class="flex items-center gap-1">
        <svg viewBox="0 0 111 111" class="h-4 w-4 text-[#E50914]" fill="currentColor"><path d="M105.062 14.28L111 30c-1.75-.25-5.499-.498-10.5-.498-22.75 0-41.5 13.5-51 31.5-9.75-18.25-28.75-31.5-51-31.5-2 0-3.5.062-5 .125L5.437 14.28C8.188 14.03 11 13.936 13.5 13.936 39.25 13.936 60.5 28.5 70.25 50.25c9.5-21.5 30.5-36.314 56.5-36.314 2.25 0 4.25.126 6.5.314l-28.188 40.03zM76.75 92.25c-8.5-4-15.75-10.75-21.25-18.75-5.5 8-12.75 14.75-21.25 18.75-3.5 1.5-7.5 2.75-12 3.75l28-40 28 40c-4.5-1-8.5-2.25-12-3.75zM15 102.5c2.75-.5 5.5-1 8.25-1.75 5.25-1.5 10.25-3.75 14.75-6.5l2-3-22-31-15 21.5c4.75 8.25 11 15 18 20.75zM85.75 100.75c2.75.75 5.5 1.25 8.25 1.75 7 5.75 13.25 12.5 18 20.75l-15-21.5-22 31 2 3c4.5 2.75 9.5 5 14.75 6.5z"/></svg>
        <span class="text-[10px] tracking-[0.2em] font-medium text-gray-300">{isTvShow ? 'SERIES' : 'FILM'}</span>
      </div>

      <!-- Title -->
      <h1 class="text-2xl font-bold leading-tight">{title}</h1>
      
      <!-- Metadata Row -->
      <div class="flex items-center gap-2 text-xs text-gray-400 font-medium mt-1">
        {#if media.vote_average}
          <span class="text-green-500 font-bold">{Math.round(media.vote_average * 10)}% Match</span>
        {/if}
        <span>2024</span>
        <span class="px-1 py-0.5 bg-[#333] text-gray-300 rounded-sm text-[10px]">TV-MA</span>
        {#if isTvShow}
          <span>{media.seasons || 1} Seasons</span>
        {/if}
        <span class="border border-gray-500 px-1 rounded-sm text-[10px]">HD</span>
        <span class="border border-gray-500 px-1 rounded-sm text-[10px]">AD</span>
      </div>

      <!-- Play & Download Buttons -->
      <div class="flex flex-col gap-2 mt-2">
        <button 
          class="w-full bg-white text-black font-bold py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
          onclick={() => netflixState.playMedia()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          Play
        </button>
        <button 
          class="w-full bg-[#2b2b2b] text-white font-bold py-2 rounded flex items-center justify-center gap-2 hover:bg-[#333] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Download
        </button>
      </div>

      <!-- Synopsis -->
      <p class="text-sm leading-snug text-white mt-1">
        <span class="font-bold text-white">{isTvShow ? "S1:E1" : ""} </span>
        {media.overview || "No synopsis available for this title. Tap Play to start watching."}
      </p>
      
      <!-- Fake Cast/Genres -->
      <p class="text-[11px] text-gray-400 leading-tight">
        <span class="text-gray-300">Starring:</span> Actor Name, Another Actor<br>
        <span class="text-gray-300">Creator:</span> Director Name
      </p>

      <!-- Action Row (My List, Rate, Share) -->
      <div class="flex items-center gap-8 mt-4 px-4">
        <div class="flex flex-col items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          <span class="text-[10px]">My List</span>
        </div>
        <div class="flex flex-col items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          <span class="text-[10px]">Rate</span>
        </div>
        <div class="flex flex-col items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <span class="text-[10px]">Share</span>
        </div>
      </div>

      <!-- Tabs Navigation (Visual only) -->
      <div class="flex items-center gap-6 border-t border-t-[#333] mt-6 pt-4 text-sm font-bold">
        {#if isTvShow}
          <div class="border-t-4 border-red-600 pt-2 -mt-[20px] text-white">Episodes</div>
          <div class="text-gray-400 pt-2 -mt-[20px]">Collection</div>
          <div class="text-gray-400 pt-2 -mt-[20px]">More Like This</div>
        {:else}
          <div class="border-t-4 border-red-600 pt-2 -mt-[20px] text-white">More Like This</div>
          <div class="text-gray-400 pt-2 -mt-[20px]">Collection</div>
        {/if}
      </div>

      <!-- Episodes List for TV Shows -->
      {#if isTvShow}
        <div class="mt-2">
          <!-- Dropdown -->
          <div class="mb-4">
            <select 
              id="season-select"
              aria-label="Select Season"
              class="bg-[#2b2b2b] text-white px-4 py-2 rounded text-sm font-medium border-none outline-none appearance-none pr-8 relative"
              bind:value={selectedSeason}
            >
              <option value={1}>Season 1</option>
              <option value={2}>Season 2</option>
              <option value={3}>Season 3</option>
            </select>
          </div>

          <!-- Dummy Episode List -->
          <div class="flex flex-col gap-6">
            <!-- Ep 1 -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-3 cursor-pointer group" onclick={() => netflixState.playMedia()} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && netflixState.playMedia()}>
                <div class="relative w-[130px] h-[75px] shrink-0 bg-[#2b2b2b] rounded flex items-center justify-center overflow-hidden">
                  <img src={media.backdrop_path} alt="Episode 1 Thumbnail" class="absolute inset-0 w-full h-full object-cover opacity-60">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" class="z-10"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="1" fill="rgba(0,0,0,0.5)"/><path d="M10 8l6 4-6 4V8z"/></svg>
                </div>
                <div class="flex flex-col justify-center flex-1">
                  <h4 class="text-sm font-medium text-white group-hover:underline">1. Pilot</h4>
                  <span class="text-xs text-gray-400">45m</span>
                </div>
                <button aria-label="Download Episode" class="text-gray-300 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                </button>
              </div>
              <p class="text-[13px] text-gray-400 leading-snug">
                {media.overview ? media.overview.substring(0, 100) + "..." : "The first episode introduces the main characters and sets the stage for the dramatic events to come."}
              </p>
            </div>

            <!-- Ep 2 -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-3 cursor-pointer group" onclick={() => netflixState.playMedia()} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && netflixState.playMedia()}>
                <div class="relative w-[130px] h-[75px] shrink-0 bg-[#2b2b2b] rounded flex items-center justify-center overflow-hidden">
                  <img src={media.poster_path} alt="Episode 2 Thumbnail" class="absolute inset-0 w-full h-full object-cover opacity-60 object-top">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" class="z-10"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="1" fill="rgba(0,0,0,0.5)"/><path d="M10 8l6 4-6 4V8z"/></svg>
                </div>
                <div class="flex flex-col justify-center flex-1">
                  <h4 class="text-sm font-medium text-white group-hover:underline">2. The Beginning</h4>
                  <span class="text-xs text-gray-400">42m</span>
                </div>
                <button aria-label="Download Episode" class="text-gray-300 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                </button>
              </div>
              <p class="text-[13px] text-gray-400 leading-snug">
                As secrets begin to unravel, an unexpected alliance is formed that changes everything.
              </p>
            </div>
          </div>
        </div>
      {/if}
      
    </div>
  {/if}
</div>
