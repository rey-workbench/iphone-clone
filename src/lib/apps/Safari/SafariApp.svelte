<script lang="ts">
  import { SafariAppState } from "./SafariAppState.svelte";
  import AppContainer from '$lib/os/components/ui/AppContainer.svelte';
  import Skeleton from "$lib/os/components/ui/Skeleton.svelte";
  import {
    ChevronLeft,
    ChevronRight,
    Share,
    BookOpen,
    Copy,
    Lock,
  } from "@lucide/svelte";

  const state = new SafariAppState();

  $effect(() => {
    const listener = (e: BeforeUnloadEvent) => {
      // console.trace("[Scramjet Debug] Page is reloading or unloading. Trace:");
    };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  });

  $effect(() => {
    state.initEngine();
  });

  const favorites = [
    { name: "Apple", url: "https://www.apple.com" },
    { name: "YouTube", url: "https://www.youtube.com" },
    { name: "Google", url: "https://www.google.com" },
    { name: "Wikipedia", url: "https://en.wikipedia.org" },
  ];

  const handleSearchKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter") state.navigate();
  };
  const closeInput = () => state.showInput = false;

  const handleResultClick = (e: MouseEvent) => {
    const url = (e.currentTarget as HTMLElement).dataset.url;
    if (url) state.navigate(url);
  };
  const handleResultKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const url = (e.currentTarget as HTMLElement).dataset.url;
      if (url) state.navigate(url);
    }
  };

  const handleFavClick = (e: MouseEvent) => {
    const url = (e.currentTarget as HTMLElement).dataset.url;
    if (url) {
      state.inputUrl = url;
      state.url = url;
      state.navigate();
    }
  };

  const handleToggleInput = () => state.toggleInput();
  const handleGoBack = () => state.goBack();
  const handleGoForward = () => state.goForward();
</script>

<AppContainer appName="Safari" bgClass="bg-[#f2f2f6]" paddingTop="pt-13.5" paddingBottom="pb-0" class="relative">
  {#if state.showInput}
    <!-- Top Address Bar (Search Mode) -->
    <div class="flex items-center gap-2 px-4 py-3 bg-[#f2f2f6] z-20">
      <div
        class="flex-1 h-10 rounded-[10px] bg-[#e3e3e8] flex items-center px-3"
      >
        <input
          bind:value={state.inputUrl}
          onkeydown={handleSearchKeydown}
          class="flex-1 bg-transparent border-none text-black text-[17px] outline-none"
        />
      </div>
      <button
        class="bg-transparent border-none text-ios-blue text-[17px] font-medium cursor-pointer px-1"
        onclick={closeInput}
      >
        Cancel
      </button>
    </div>
  {/if}

  <!-- Main Content Area -->
  <div
    class="flex-1 relative overflow-y-auto z-10 {state.showInput || !state.url
      ? 'bg-[#f2f2f6]'
      : 'bg-white'}"
  >
    {#if state.isSearching}
      <div class="p-6 flex flex-col gap-6">
        {#each Array(5) as _, i (i)}
          <div class="flex flex-col gap-2">
            <Skeleton width="33%" height="16px" borderRadius="4px" />
            <Skeleton width="75%" height="20px" borderRadius="4px" />
            <Skeleton
              width="100%"
              height="40px"
              borderRadius="4px"
              class="mt-1"
            />
          </div>
        {/each}
      </div>
    {:else if state.searchError}
      <div class="p-6 text-red-500 font-medium">Error: {state.searchError}</div>
    {:else if state.searchResults}
      <div class="p-4 flex flex-col gap-6 bg-white min-h-full">
        {#each state.searchResults as result, i (i)}
          <div
            role="button"
            tabindex="0"
            data-url={result.url}
            class="flex flex-col gap-1 cursor-pointer"
            onclick={handleResultClick}
            onkeydown={handleResultKeydown}
          >
            <div class="text-[12px] text-gray-500 truncate">{result.url}</div>
            <div
              class="text-[18px] text-[#1a0dab] hover:underline font-medium leading-tight"
            >
              {result.title}
            </div>
            <div
              class="text-[14px] text-[#4d5156] leading-snug line-clamp-3 mt-1"
            >
              {result.description || result.content || result.snippet || ""}
            </div>
          </div>
        {/each}
        {#if state.searchResults.length === 0}
          <div class="text-gray-500 mt-4 text-center">No results found.</div>
        {/if}
      </div>
    {:else if !state.url && !state.showInput}
      <!-- Start Page -->
      <div class="p-6">
        <h1 class="text-2xl font-bold mb-6 text-black">Favorites</h1>
        <div class="grid grid-cols-4 gap-y-6 gap-x-2">
          {#each favorites as fav (fav.url)}
            <button
              data-url={fav.url}
              class="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer"
              onclick={handleFavClick}
            >
              <div
                class="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden"
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${new URL(fav.url).hostname}&sz=128`}
                  alt={fav.name}
                  class="w-10 h-10 object-contain rounded-md"
                />
              </div>
              <span
                class="text-[11px] text-gray-500 truncate w-full text-center"
                >{fav.name}</span
              >
            </button>
          {/each}
        </div>
      </div>
    {:else}
      {#if state.errorMessage}
        <div
          class="p-6 text-red-500 flex items-center justify-center h-full text-center font-bold"
        >
          {state.errorMessage}
        </div>
      {:else if !state.isReady}
        <div class="p-6 text-gray-500 flex items-center justify-center h-full">
          Loading Scramjet engine...
        </div>
      {/if}

      <!-- Container for Scramjet iframe -->
      <div
        id="safari-container"
        class="absolute inset-0 w-full h-full bg-white {state.isReady &&
        state.url &&
        !state.searchResults &&
        !state.isSearching &&
        !state.errorMessage
          ? 'block'
          : 'hidden'}"
      ></div>
    {/if}
  </div>

  {#if !state.showInput}
    <!-- Bottom Address Bar and Toolbar -->
    <div
      class="bg-[rgba(242,242,246,0.9)] backdrop-blur-md border-t border-gray-300 pb-8 pt-2 flex flex-col gap-2 z-20"
    >
      <!-- Floating Address Pill -->
      <div class="px-3">
        <button
          class="w-full h-11 rounded-[12px] bg-white shadow-sm flex items-center justify-center gap-2 text-black text-[15px] cursor-pointer border border-gray-200"
          onclick={handleToggleInput}
        >
          <span class="flex items-center justify-center text-gray-400">
            <Lock size={14} />
          </span>
          {#if state.url}
            {state.url
              .replace(/^https?:\/\//, "")
              .replace(/\/$/, "")
              .substring(0, 40)}
          {:else}
            Search or enter website name
          {/if}
        </button>
      </div>

      <!-- Bottom Toolbar Icons -->
      <div class="flex items-center justify-between px-5 pt-1 pb-1">
        <button
          class="text-ios-blue bg-transparent border-none p-2 cursor-pointer disabled:opacity-30"
          onclick={handleGoBack}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          class="text-ios-blue bg-transparent border-none p-2 cursor-pointer disabled:opacity-30"
          onclick={handleGoForward}
        >
          <ChevronRight size={24} />
        </button>
        <button
          class="text-ios-blue bg-transparent border-none p-2 cursor-pointer"
        >
          <Share size={24} />
        </button>
        <button
          class="text-ios-blue bg-transparent border-none p-2 cursor-pointer"
        >
          <BookOpen size={24} />
        </button>
        <button
          class="text-ios-blue bg-transparent border-none p-2 cursor-pointer"
        >
          <Copy size={24} />
        </button>
      </div>
    </div>
  {/if}
</AppContainer>
