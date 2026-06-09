<script lang="ts">
  import { AppSafariState } from "./SafariState.svelte";
  import { onMount } from "svelte";

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
        await loadScript("/scram/scramjet_bundled.js");
        await loadScript("/scram/controller.api.js");
        await loadScript("/libcurl/index.js");

        const LibcurlClient = (window as any).LibcurlTransport.default;
        const wispUrl = location.origin.replace(/^http/, "ws") + "/wisp/";

        const transport = new LibcurlClient({ wisp: wispUrl });
        await transport.init();

        const { Controller } = (window as any).$scramjetController;
        const reg = await navigator.serviceWorker.register("/scramjet-sw.js", {
          scope: "/",
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
          state.frameObj.go(state.url);
        }
      } catch (err: any) {
        console.error("[Scramjet] Initialization failed", err);
        state.errorMessage = err.toString();
      }
    }
  });
</script>

<div class="h-full pt-[54px] pb-5 bg-ios-bg flex flex-col">
  <div class="flex-1 relative overflow-y-auto bg-white">
    {#if state.isSearching}
      <div class="p-6 flex flex-col gap-6">
        {#each Array(5) as _}
          <div class="animate-pulse flex flex-col gap-2">
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-5 bg-gray-200 rounded w-3/4"></div>
            <div class="h-10 bg-gray-200 rounded w-full mt-1"></div>
          </div>
        {/each}
      </div>
    {:else if state.searchError}
      <div class="p-6 text-red-500 font-medium">Error: {state.searchError}</div>
    {:else if state.searchResults}
      <div class="p-4 flex flex-col gap-6">
        {#each state.searchResults as result}
          <div
            class="flex flex-col gap-1 cursor-pointer"
            onclick={() => {
              state.url = result.url;
              state.searchResults = null;
              state.navigate(); // trigger scramjet navigation
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
        !state.searchResults &&
        !state.isSearching &&
        !state.errorMessage
          ? 'block'
          : 'hidden'}"
      ></div>
    {/if}
  </div>
  <div
    class="flex items-center gap-2 px-3 py-2 bg-[rgba(30,30,30,0.95)] border-t border-ios-sep"
  >
    {#if state.showInput}
      <input
        bind:value={state.inputUrl}
        onkeydown={(e: KeyboardEvent) => e.key === "Enter" && state.navigate()}
        class="flex-1 h-9 rounded-[10px] bg-ios-fill border-none text-white px-3 text-[15px] outline-none"
      />
      <button
        class="bg-transparent border-none text-ios-blue text-[15px] font-medium cursor-pointer"
        onclick={() => state.navigate()}>Go</button
      >
    {:else}
      <button
        class="flex-1 h-9 rounded-[10px] bg-ios-fill flex items-center justify-center text-ios-label2 text-[15px] cursor-pointer border-none"
        onclick={() => state.toggleInput()}
      >
        {state.url
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "")
          .substring(0, 40)}
      </button>
    {/if}
  </div>
</div>
