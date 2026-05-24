<script lang="ts">
  import { netflixState } from "./NetflixState.svelte";
  import MovieDetail from "./components/MovieDetail.svelte";
  import { systemState } from "$lib/states";
  import Player from "./components/Player.svelte";
  import { onMount } from "svelte";

  let headerOpacity = $state(0);
  let activeTab = $state("home"); // 'home', 'search'
  let searchQuery = $state("");

  function handleScroll(e: Event) {
    const target = e.target as HTMLElement;
    headerOpacity = Math.min(target.scrollTop / 100, 1);
  }

  let serverSearchResults = $state<any[]>([]);

  let searchResults = $derived(
    searchQuery.length > 0 && serverSearchResults.length > 0
      ? serverSearchResults
      : [...netflixState.movies, ...netflixState.tvShows].filter((item) =>
          (item.title || item.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        )
  );

  $effect(() => {
    if (searchQuery.trim().length > 2) {
      const timeout = setTimeout(async () => {
        try {
          const res = await fetch(`/api/netflix/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            serverSearchResults = data.results || [];
          }
        } catch (e) {
          console.error("Search failed", e);
        }
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      serverSearchResults = [];
    }
  });

  onMount(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (netflixState.view !== 'home') {
        netflixState.goBack(true);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  });

  let top10Movies = $derived(netflixState.movies.slice(0, 10));
</script>

<div
  class="w-full h-full bg-ios-bg text-white flex flex-col font-sans overflow-hidden"
>
  {#if netflixState.view === "home"}
    <!-- Active Tab: Home -->
    {#if activeTab === "home"}
      <!-- Header -->
      <div
        class="absolute top-0 left-0 w-full z-20 flex flex-col pt-12 pb-2 transition-colors duration-300"
        style="background-color: rgba(0, 0, 0, {headerOpacity});"
      >
        <!-- Top Bar -->
        <div class="flex items-center justify-between px-4 mb-4">
          <!-- Pseudo Netflix Logo (N) -->
          <div class="flex items-center gap-1">
            <img
              src="/assets/icons/netflix-brand-logo.png"
              alt="Netflix"
              class="h-8 w-auto object-contain"
            />
          </div>
          <div class="flex gap-4 items-center text-white">
            <button
              aria-label="Cast"
              class="bg-transparent border-none text-white"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><rect width="20" height="15" x="2" y="7" rx="2" ry="2" /><path
                  d="M17 7V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2"
                /></svg
              ></button
            >
            <button
              aria-label="Profile"
              class="w-6 h-6 rounded bg-blue-500 overflow-hidden"
              ><img
                src="https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-88wkdmjrorckekha.jpg"
                alt="Profile"
                class="w-full h-full object-cover"
              /></button
            >
          </div>
        </div>

        <!-- Category Nav -->
        <div
          class="flex gap-6 text-[13px] font-semibold text-white justify-center items-center px-4 drop-shadow-md"
        >
          <button class="bg-transparent border-none text-white">TV Shows</button
          >
          <button class="bg-transparent border-none text-white">Movies</button>
          <button
            class="bg-transparent border-none text-white flex items-center gap-1"
            >Categories <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg
            ></button
          >
        </div>
      </div>

      <!-- Main Content Scroll -->
      <div
        class="flex-1 overflow-y-auto pb-20 no-scrollbar relative z-10"
        onscroll={handleScroll}
      >
        <!-- Hero Banner -->
        {#if netflixState.movies.length > 0}
          <div class="relative w-full h-[550px]">
            <img
              src={netflixState.movies[0].poster_path}
              alt={netflixState.movies[0].title}
              class="w-full h-full object-cover object-center"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-ios-bg via-transparent to-ios-bg/40"
            ></div>

            <div
              class="absolute bottom-0 left-0 w-full pb-6 flex flex-col items-center gap-4"
            >
              <!-- Title graphic (Using text as fallback) -->
              <h1
                class="text-5xl font-black text-center tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4 leading-none uppercase"
              >
                {netflixState.movies[0].title}
              </h1>

              <div
                class="text-[11px] font-semibold text-white drop-shadow-md tracking-wider"
              >
                Exciting • Reality TV • Competition
              </div>

              <!-- Hero Actions -->
              <div class="flex items-center justify-center gap-8 w-full mt-2">
                <button
                  class="flex flex-col items-center gap-1 text-white hover:text-gray-300"
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
                    ><line x1="12" x2="12" y1="5" y2="19" /><line
                      x1="5"
                      x2="19"
                      y1="12"
                      y2="12"
                    /></svg
                  >
                  <span class="text-[10px] font-medium">My List</span>
                </button>

                <button
                  class="bg-white text-black font-bold py-2 px-8 rounded flex items-center justify-center gap-2 hover:bg-white/80 transition-colors"
                  onclick={() =>
                    netflixState.selectMedia(netflixState.movies[0])}
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
                  class="flex flex-col items-center gap-1 text-white hover:text-gray-300"
                  onclick={() =>
                    netflixState.selectMedia(netflixState.movies[0])}
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
                    ><circle cx="12" cy="12" r="10" /><path
                      d="M12 16v-4"
                    /><path d="M12 8h.01" /></svg
                  >
                  <span class="text-[10px] font-medium">Info</span>
                </button>
              </div>
            </div>
          </div>
        {:else}
          <div
            class="w-full h-[550px] flex items-center justify-center bg-black"
          >
            <div
              class="w-8 h-8 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
        {/if}

        <!-- Rows -->
        <div class="flex flex-col gap-8 mt-2">
          <!-- Continue Watching -->
          <div class="w-full">
            <h2 class="text-[15px] font-bold px-4 mb-2 text-gray-100">
              Continue Watching for {systemState.currentUser?.name?.split(
                " ",
              )[0] || "Guest"}
            </h2>
            <div
              class="flex overflow-x-auto px-4 pb-2 gap-2 no-scrollbar snap-x"
            >
              {#each top10Movies as movie, i}
                {#if i < 4}
                  <button
                    class="relative flex-none w-[105px] h-[155px] rounded overflow-hidden bg-[#222] snap-start transition-transform hover:scale-105"
                    onclick={() => netflixState.selectMedia(movie)}
                    aria-label="Watch {movie.title}"
                  >
                    <!-- Small N Logo -->
                    <div class="absolute top-1 left-1 z-10 w-3 h-4">
                      <img
                        src="/assets/icons/netflix-brand-logo.png"
                        alt="N"
                        class="w-full h-full object-contain"
                      />
                    </div>
                    <!-- Poster -->
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <!-- Play icon overlay -->
                    <div
                      class="absolute inset-0 bg-black/30 flex items-center justify-center"
                    >
                      <div
                        class="w-10 h-10 rounded-full border border-white flex items-center justify-center bg-black/50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="white"
                          class="ml-0.5"><path d="M8 5v14l11-7z" /></svg
                        >
                      </div>
                    </div>
                    <!-- Progress bar -->
                    <div
                      class="absolute bottom-0 left-0 w-full h-[3px] bg-gray-600"
                    >
                      <div class="h-full bg-[#E50914] w-1/3"></div>
                    </div>
                  </button>
                {/if}
              {/each}
            </div>
          </div>

          <!-- Top 10 Today -->
          <div class="w-full overflow-hidden">
            <h2 class="text-[15px] font-bold px-4 mb-2 text-gray-100">
              Top 10 TV Shows Today
            </h2>
            <div
              class="flex overflow-x-auto px-4 pb-4 gap-0 no-scrollbar snap-x"
            >
              {#each netflixState.tvShows.slice(0, 10) as tv, i}
                <button
                  class="relative flex-none w-[135px] h-[165px] flex items-end justify-end overflow-visible snap-start transition-transform hover:scale-105"
                  onclick={() => netflixState.selectMedia(tv)}
                  aria-label="View {tv.title}"
                >
                  <!-- Huge Top 10 Number -->
                  <div
                    class="absolute left-4 bottom-[-8px] text-[85px] font-black text-black z-20 tracking-tighter drop-shadow-md"
                    style="-webkit-text-stroke: 3px white; color: black; line-height: 0.8; font-family: Impact, sans-serif;"
                  >
                    {i + 1}
                  </div>
                  <!-- Poster -->
                  <div
                    class="w-[110px] h-[165px] relative z-10 rounded overflow-hidden"
                  >
                    <img
                      src={tv.poster_path}
                      alt={tv.title}
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <!-- N Logo -->
                    <div class="absolute top-1 left-1 z-10 w-3 h-4">
                      <img
                        src="/assets/icons/netflix-brand-logo.png"
                        alt="N"
                        class="w-full h-full object-contain"
                      />
                    </div>
                    <!-- Top 10 Badge -->
                    <div
                      class="absolute top-0 right-0 bg-[#E50914] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl tracking-wider shadow-md"
                    >
                      TOP<br />10
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Active Tab: Search -->
    {:else if activeTab === "search"}
      <div class="flex flex-col h-full bg-black pt-12">
        <!-- Search Bar -->
        <div class="px-4 pb-4">
          <div class="flex items-center bg-[#333] rounded overflow-hidden">
            <div class="pl-3 py-2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><circle cx="11" cy="11" r="8" /><path
                  d="m21 21-4.3-4.3"
                /></svg
              >
            </div>
            <input
              type="text"
              placeholder="Search"
              class="w-full bg-transparent border-none outline-none text-white px-2 py-2 text-sm"
              bind:value={searchQuery}
            />
            {#if searchQuery}
              <button
                class="pr-3 py-2 text-gray-400"
                onclick={() => (searchQuery = "")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><line x1="18" y1="6" x2="6" y2="18" /><line
                    x1="6"
                    y1="6"
                    x2="18"
                    y2="18"
                  /></svg
                >
              </button>
            {/if}
          </div>
        </div>

        <!-- Search Results -->
        <div class="flex-1 overflow-y-auto no-scrollbar pb-20">
          {#if searchQuery === ""}
            <h2 class="text-xl font-bold px-4 mb-4 mt-2">Movies & TV</h2>
            <div class="flex flex-col">
              {#each searchResults as item}
                <button
                  class="flex items-center gap-3 w-full bg-[#111] hover:bg-[#222] transition-colors mb-0.5 relative group"
                  onclick={() => netflixState.selectMedia(item)}
                  aria-label="View {item.title}"
                >
                  <div class="w-[140px] h-[75px] shrink-0 relative">
                    <img
                      src={item.backdrop_path || item.poster_path}
                      alt={item.title}
                      class="w-full h-full object-cover"
                    />
                    <!-- N Logo -->
                    <div class="absolute top-1 left-1 z-10 w-2 h-3">
                      <img
                        src="/assets/icons/netflix-brand-logo.png"
                        alt="N"
                        class="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div class="flex-1 text-left">
                    <h3 class="text-sm font-semibold text-gray-200">
                      {item.title}
                    </h3>
                  </div>
                  <div class="pr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-white"
                      ><circle cx="12" cy="12" r="10" /><polygon
                        points="10 8 16 12 10 16 10 8"
                      /></svg
                    >
                  </div>
                </button>
              {/each}
            </div>
          {:else}
            <h2 class="text-xl font-bold px-4 mb-4 mt-2">Movies & TV</h2>
            <div class="grid grid-cols-3 gap-2 px-2">
              {#each searchResults as item}
                <button
                  class="w-full aspect-[2/3] relative rounded overflow-hidden"
                  onclick={() => netflixState.selectMedia(item)}
                >
                  <img
                    src={item.poster_path}
                    alt={item.title}
                    class="w-full h-full object-cover"
                  />
                  <!-- N Logo -->
                  <div class="absolute top-1 left-1 z-10 w-2 h-3">
                    <img
                      src="/assets/icons/netflix-brand-logo.png"
                      alt="N"
                      class="w-full h-full object-contain"
                    />
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Bottom Navigation Bar -->
    <div
      class="absolute bottom-0 left-0 w-full bg-[#141414]/95 backdrop-blur-lg border-t border-[#333] z-50 flex justify-around items-center pt-2 pb-6 px-2"
    >
      <button
        class="flex flex-col items-center gap-1 w-16"
        onclick={() => (activeTab = "home")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={activeTab === "home" ? "white" : "none"}
          stroke={activeTab === "home" ? "none" : "currentColor"}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class={activeTab === "home" ? "text-white" : "text-gray-500"}
          ><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline
            points="9 22 9 12 15 12 15 22"
          /></svg
        >
        <span
          class="text-[9px] {activeTab === 'home'
            ? 'text-white font-bold'
            : 'text-gray-500'}">Home</span
        >
      </button>

      <button class="flex flex-col items-center gap-1 w-16 opacity-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-gray-500"><polygon points="5 3 19 12 5 21 5 3" /></svg
        >
        <span class="text-[9px] text-gray-500">New & Hot</span>
      </button>

      <button class="flex flex-col items-center gap-1 w-16 opacity-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-gray-500"
          ><path
            d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
          /><path d="m8 10 4-4 4 4" /><path d="m8 14 4 4 4-4" /></svg
        >
        <span class="text-[9px] text-gray-500">Fast Laughs</span>
      </button>

      <button
        class="flex flex-col items-center gap-1 w-16"
        onclick={() => (activeTab = "search")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width={activeTab === "search" ? "3" : "2"}
          stroke-linecap="round"
          stroke-linejoin="round"
          class={activeTab === "search" ? "text-white" : "text-gray-500"}
          ><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
        >
        <span
          class="text-[9px] {activeTab === 'search'
            ? 'text-white font-bold'
            : 'text-gray-500'}">Search</span
        >
      </button>

      <button class="flex flex-col items-center gap-1 w-16 opacity-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-gray-500"
          ><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
            points="7 10 12 15 17 10"
          /><line x1="12" x2="12" y1="15" y2="3" /></svg
        >
        <span class="text-[9px] text-gray-500">Downloads</span>
      </button>
    </div>
  {:else if netflixState.view === "detail"}
    <MovieDetail />
  {:else if netflixState.view === "player"}
    <Player />
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
