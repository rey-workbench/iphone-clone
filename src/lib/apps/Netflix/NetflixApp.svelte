<script lang="ts">
  import { netflixState } from "./NetflixState.svelte";
  import MovieDetail from "./components/MovieDetail.svelte";
  import Player from "./components/Player.svelte";
  import HomeTab from "./components/HomeTab.svelte";
  import SearchTab from "./components/SearchTab.svelte";
  import { getContext } from 'svelte';
  import Skeleton from "$lib/os/components/ui/Skeleton.svelte";
  import { systemState } from "$lib/states";

  const isPreview = getContext("isPreview");

  let headerOpacity = $state(0);
  let activeTab = $state("home"); // 'home', 'search'

  const setTabHome = () => activeTab = "home";
  const setTabSearch = () => activeTab = "search";

  function handleScroll(e: Event) {
    const target = e.target as HTMLElement;
    headerOpacity = Math.min(target.scrollTop / 100, 1);
  }

  const searchResults = $derived(
    netflixState.searchQuery.length > 0 && netflixState.serverSearchResults.length > 0
      ? netflixState.serverSearchResults
      : netflixState.localSearchResults
  );


  const handleSelectSearchItem = (e: MouseEvent) => {
    const id = (e.currentTarget as HTMLElement).dataset.id;
    if (id) {
      const item = netflixState.movies.find((m) => String(m.id) === id) || netflixState.tvShows.find((m) => String(m.id) === id);
      if (item) netflixState.selectMedia(item);
    }
  };



  $effect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Ignore popstate if the framebuster script called history.back()
      // and consumed a dummy state, landing us back in our valid 'detail' state
      if (e.state?.netflixModal === "detail") return;
      // Also ignore if we landed on another dummy state in the chain
      if (e.state?.dummy) return;

      if (netflixState.view !== "home") {
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
        class="absolute top-0 left-0 w-full z-20 flex flex-col pt-12 pb-2 transition-colors duration-300 bg-black"
        style:--tw-bg-opacity={headerOpacity}
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
            >
              <img src="https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-88wkdmjrorckekha.jpg" alt="Profile" class="w-full h-full object-cover" />
            </button>
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

      <HomeTab {handleScroll} />

      <!-- Active Tab: Search -->
      <SearchTab bind:searchQuery={netflixState.searchQuery} {searchResults} />
    {/if}

    <div
      class="absolute bottom-0 left-0 w-full bg-[#141414]/95 backdrop-blur-lg border-t border-[#333] z-50 flex justify-around items-center pt-2 pb-8 px-2"
    >
      <button
        class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer"
        onclick={setTabHome}
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
        class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer"
        onclick={setTabSearch}
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
</style>
