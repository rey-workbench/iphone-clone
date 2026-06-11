<script lang="ts">
  import { AppSafariState } from "./SafariState.svelte";
  import { onMount } from "svelte";
  import { dialogState } from "$lib/states/dialogState.svelte";
  import Skeleton from "$lib/components/ui/Skeleton.svelte";
  import {
    ChevronLeft,
    ChevronRight,
    Share,
    BookOpen,
    Copy,
    Lock,
  } from "@lucide/svelte";

  const state = new AppSafariState();

  onMount(async () => {
    // Add debugging for page unloads
    window.addEventListener("beforeunload", (e) => {
      console.trace("[Scramjet Debug] Page is reloading or unloading. Trace:");
    });

    if ("serviceWorker" in navigator) {
      const loadScript = (src: string) =>
        new Promise<void>((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) return resolve();
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        });

      try {
        const origExports = (window as any).exports;
        const origModule = (window as any).module;
        const origDefine = (window as any).define;
        (window as any).exports = undefined;
        (window as any).module = undefined;
        (window as any).define = undefined;

        await loadScript("/scram/scramjet_bundled.js");
        await loadScript("/scram/controller.api.js");
        await loadScript("/libcurl/index.js");

        (window as any).exports = origExports;
        (window as any).module = origModule;
        (window as any).define = origDefine;

        const LibcurlTransport = (window as any).LibcurlTransport;
        if (!LibcurlTransport?.default) {
          throw new Error(
            "Scramjet/Libcurl scripts failed to load. Missing static/scram/ or static/libcurl/ files.",
          );
        }

        const LibcurlClient = LibcurlTransport.default;
        const isLocal =
          location.hostname === "localhost" ||
          location.hostname === "127.0.0.1" ||
          location.hostname.startsWith("192.168.") ||
          location.hostname.startsWith("10.") ||
          location.hostname.endsWith(".local") ||
          location.hostname.startsWith("172.");
        const wispUrl = isLocal
          ? location.origin.replace(/^http/, "ws") + "/wisp/"
          : "wss://wisp.mercurywork.shop/";

        const transport = new LibcurlClient({ wisp: wispUrl });
        await transport.init();

        const scramjetController = (window as any).$scramjetController;
        if (!scramjetController?.Controller) {
          throw new Error(
            "Scramjet Controller not found on window.$scramjetController",
          );
        }
        const { Controller } = scramjetController;
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const r of registrations) {
          if (
            r.active?.scriptURL.includes("scramjet-sw.js") &&
            r.scope === location.origin + "/"
          ) {
            await r.unregister();
          }
        }

        const reg = await navigator.serviceWorker.register("/scramjet-sw.js", {
          scope: "/scramjet/",
        });

        const waitForActive = (worker: ServiceWorker | null) =>
          new Promise<void>((resolve) => {
            if (!worker) return resolve();
            if (worker.state === "activated") return resolve();
            worker.addEventListener("statechange", () => {
              if (worker.state === "activated") resolve();
            });
          });

        if (!reg.active) {
          await waitForActive(reg.installing || reg.waiting);
        }

        const serviceworker = reg.active!;

        state.scramjet = new Controller({
          serviceworker,
          transport,
          config: {
            prefix: "/scramjet/",
            scramjetPath: "/scram/scramjet_bundled.js",
            injectPath: "/scram/controller.inject.js",
            wasmPath: "/scram/scramjet.wasm",
          },
        });

        await state.scramjet.wait();

        state.isReady = true;

        // Initialize the frame
        if (!state.frameObj && document.getElementById("safari-container")) {
          const iframe = document.createElement("iframe");
          iframe.className =
            "absolute inset-0 w-full h-full border-none bg-white";
          state.frameObj = state.scramjet.createFrame(iframe);
          document.getElementById("safari-container")!.appendChild(iframe);
          if (state.url) {
            state.frameObj.go(state.url);
          }
        }
      } catch (err: any) {
        dialogState.show({
          title: "Safari Proxy Error",
          message: err.message || "Scramjet initialization failed.",
          confirmText: "OK",
        });
      }
    }
  });

  const favorites = [
    { name: "Apple", url: "https://www.apple.com" },
    { name: "YouTube", url: "https://www.youtube.com" },
    { name: "Google", url: "https://www.google.com" },
    { name: "Wikipedia", url: "https://en.wikipedia.org" },
  ];
</script>

<div class="h-full pt-13.5 flex flex-col bg-[#f2f2f6] relative">
  {#if state.showInput}
    <!-- Top Address Bar (Search Mode) -->
    <div class="flex items-center gap-2 px-4 py-3 bg-[#f2f2f6] z-20">
      <div
        class="flex-1 h-10 rounded-[10px] bg-[#e3e3e8] flex items-center px-3"
      >
        <input
          bind:value={state.inputUrl}
          onkeydown={(e: KeyboardEvent) =>
            e.key === "Enter" && state.navigate()}
          class="flex-1 bg-transparent border-none text-black text-[17px] outline-none"
        />
      </div>
      <button
        class="bg-transparent border-none text-ios-blue text-[17px] font-medium cursor-pointer px-1"
        onclick={() => (state.showInput = false)}
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
        {#each Array(5) as _}
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
        {#each state.searchResults as result}
          <div
            role="button"
            tabindex="0"
            class="flex flex-col gap-1 cursor-pointer"
            onclick={() => {
              state.navigate(result.url);
            }}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                state.navigate(result.url);
              }
            }}
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
          {#each favorites as fav}
            <button
              class="flex flex-col items-center gap-2 bg-transparent border-none cursor-pointer"
              onclick={() => {
                state.inputUrl = fav.url;
                state.url = fav.url;
                state.navigate();
              }}
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
          onclick={() => state.toggleInput()}
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
          onclick={() => state.goBack()}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          class="text-ios-blue bg-transparent border-none p-2 cursor-pointer disabled:opacity-30"
          onclick={() => state.goForward()}
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
</div>
