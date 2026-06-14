<script lang="ts">
  import { netflixState } from "./NetflixAppState.svelte";
  import MovieDetail from "./components/MovieDetail.svelte";
  import Player from "./components/Player.svelte";
  import HomeTab from "./components/HomeTab.svelte";
  import SearchTab from "./components/SearchTab.svelte";
  import DownloadsTab from "./components/DownloadsTab.svelte";
  import ComingSoonTab from "./components/ComingSoonTab.svelte";
  import MoreTab from "./components/MoreTab.svelte";


  import { Home, Search, PlaySquare, Download, Menu } from "@lucide/svelte";



  let headerOpacity = $state(0);
  let activeTab = $state("home"); // 'home', 'search', 'coming_soon', 'downloads', 'more'

  const setTabHome = () => (activeTab = "home");
  const setTabSearch = () => (activeTab = "search");
  const setTabComingSoon = () => (activeTab = "coming_soon");
  const setTabDownloads = () => (activeTab = "downloads");
  const setTabMore = () => (activeTab = "more");

  function handleScroll(e: Event) {
    const target = e.target as HTMLElement;
    headerOpacity = Math.min(target.scrollTop / 100, 1);
  }

  const searchResults = $derived(
    netflixState.searchQuery.length > 0 &&
      netflixState.serverSearchResults.length > 0
      ? netflixState.serverSearchResults
      : netflixState.localSearchResults,
  );



  $effect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.netflixModal === "detail") return;
      if (e.state?.dummy) return;
      if (netflixState.view !== "home") {
        netflixState.goBack(true);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  });
</script>

<div
  class="w-full h-full bg-black text-white flex flex-col font-sans overflow-hidden"
>
  {#if netflixState.view === "home"}
    <!-- Active Tabs Content -->
    <div
      class="flex-1 relative bg-linear-to-b from-[#700000] via-[#300000] to-black bg-fixed overflow-hidden"
    >
      {#if activeTab === "home"}
        <!-- Top Global Header -->
        <div
          class="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-4 pt-12 pb-4 bg-linear-to-b from-[#141414]/90 via-[#141414]/50 to-transparent transition-opacity duration-300"
          style:opacity={activeTab === 'home' ? 1 - headerOpacity : 1}
        >
          <!-- Top Bar -->
          <div class="flex items-center px-4 mb-2 gap-4">
            <!-- N Logo -->
            <img
              src="/assets/icons/netflix-brand-logo.png"
              alt="Netflix"
              class="h-8 w-auto object-contain"
            />
            <!-- Category Nav -->
            <div
              class="flex gap-4 text-[15px] font-medium text-white items-center drop-shadow-md"
            >
              <button
                class="bg-transparent border-none text-white cursor-pointer hover:text-gray-300"
                >TV programmes</button
              >
              <button
                class="bg-transparent border-none text-white cursor-pointer hover:text-gray-300"
                >Films</button
              >
              <button
                class="bg-transparent border-none text-white cursor-pointer flex items-center gap-1 hover:text-gray-300"
              >
                My List
              </button>
            </div>
          </div>
        </div>
        <HomeTab {handleScroll} />
      {:else if activeTab === "search"}
        <SearchTab
          bind:searchQuery={netflixState.searchQuery}
          {searchResults}
        />
      {:else if activeTab === "coming_soon"}
        <ComingSoonTab />
      {:else if activeTab === "downloads"}
        <DownloadsTab />
      {:else if activeTab === "more"}
        <MoreTab />
      {/if}
    </div>

    <!-- Bottom Navigation Bar -->
    <div
      class="absolute bottom-0 left-0 w-full bg-[#141414]/80 backdrop-blur-xl border-t border-[#333]/50 z-50 flex justify-around items-center pt-2 pb-8 px-2"
    >
      <button
        class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer"
        onclick={setTabHome}
      >
        <Home
          size={22}
          class={activeTab === "home" ? "text-white" : "text-ios-gray"}
          strokeWidth={activeTab === "home" ? 2.5 : 2}
        />
        <span
          class="text-[10px] {activeTab === 'home'
            ? 'text-white font-medium'
            : 'text-ios-gray'}">Home</span
        >
      </button>

      <button
        class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer"
        onclick={setTabSearch}
      >
        <Search
          size={22}
          class={activeTab === "search" ? "text-white" : "text-ios-gray"}
          strokeWidth={activeTab === "search" ? 2.5 : 2}
        />
        <span
          class="text-[10px] {activeTab === 'search'
            ? 'text-white font-medium'
            : 'text-ios-gray'}">Search</span
        >
      </button>

      <button
        class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer"
        onclick={setTabComingSoon}
      >
        <PlaySquare
          size={22}
          class={activeTab === "coming_soon" ? "text-white" : "text-ios-gray"}
          strokeWidth={activeTab === "coming_soon" ? 2.5 : 2}
        />
        <span
          class="text-[10px] {activeTab === 'coming_soon'
            ? 'text-white font-medium'
            : 'text-ios-gray'}">Coming Soon</span
        >
      </button>

      <button
        class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer"
        onclick={setTabDownloads}
      >
        <Download
          size={22}
          class={activeTab === "downloads" ? "text-white" : "text-ios-gray"}
          strokeWidth={activeTab === "downloads" ? 2.5 : 2}
        />
        <span
          class="text-[10px] {activeTab === 'downloads'
            ? 'text-white font-medium'
            : 'text-ios-gray'}">Downloads</span
        >
      </button>

      <button
        class="flex flex-col items-center gap-1 w-16 bg-transparent border-none cursor-pointer"
        onclick={setTabMore}
      >
        <Menu
          size={22}
          class={activeTab === "more" ? "text-white" : "text-ios-gray"}
          strokeWidth={activeTab === "more" ? 2.5 : 2}
        />
        <span
          class="text-[10px] {activeTab === 'more'
            ? 'text-white font-medium'
            : 'text-ios-gray'}">More</span
        >
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
