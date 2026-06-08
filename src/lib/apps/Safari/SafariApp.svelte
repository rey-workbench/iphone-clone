<script lang="ts">
  import { AppSafariState } from './SafariState.svelte';
  import { onMount } from 'svelte';

  const state = new AppSafariState();

  onMount(async () => {
    if ('serviceWorker' in navigator) {
      const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // Load UV scripts and bare-mux
      await loadScript('/uv/uv.bundle.js');
      await loadScript('/uv/uv.config.js');
      await loadScript('/bare-mux/index.js');

      // Register Service Worker
      let reg: ServiceWorkerRegistration | undefined;
      try {
        // Always register fresh — forces update when sw.js changes
        reg = await navigator.serviceWorker.register('/uv/sw.js', {
          scope: '/uv/service/',
          updateViaCache: 'none'
        });
        // Trigger update check so new sw.js is picked up immediately
        try { await reg.update(); } catch {}

        // Wait until the service worker is activated
        if (reg) {
          const sw = reg.installing ?? reg.waiting ?? reg.active;
          if (sw && sw.state !== 'activated') {
            await new Promise<void>(resolve => {
              sw.addEventListener('statechange', function handler() {
                if (this.state === 'activated') {
                  sw.removeEventListener('statechange', handler);
                  resolve();
                }
              });
            });
          }
        }
      } catch (err) {
        console.error("[UV] Service worker registration failed", err);
      }

      // Set epoxy-transport (Wisp protocol) instead of deprecated bare transport
      try {
        const BareMux = (window as any).BareMux;
        const conn = new BareMux.BareMuxConnection("/bare-mux/worker.js");
        const wispUrl = location.origin.replace(/^http/, 'ws') + "/wisp/";
        await conn.setTransport("/epoxy/index.mjs", [{
          wisp: wispUrl,
          // epoxy-tls has no system CA trust store in browser — disable cert validation
          // to avoid HandshakeFailure on HTTPS sites in dev.
          disable_certificate_validation: true,
          redirect_limit: 10,
        }]);
        console.log("[UV] Epoxy transport initialized via Wisp:", wispUrl);
      } catch (err) {
        console.error("[UV] Failed to initialize Epoxy transport", err);
      }

      state.isReady = true;
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
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div class="flex flex-col gap-1 cursor-pointer" onclick={() => {
            state.url = result.url;
            state.searchResults = null;
          }}>
            <div class="text-[12px] text-gray-500 truncate">{result.url}</div>
            <div class="text-[18px] text-[#1a0dab] hover:underline font-medium leading-tight">{result.title}</div>
            <div class="text-[14px] text-[#4d5156] leading-snug line-clamp-3 mt-1">{result.description || result.content || result.snippet || ''}</div>
          </div>
        {/each}
        {#if state.searchResults.length === 0}
          <div class="text-gray-500 mt-4 text-center">No results found.</div>
        {/if}
      </div>
    {:else}
      {#if state.isReady}
        <iframe 
          src={state.iframeUrl} 
          title="Browser" 
          class="absolute inset-0 w-full h-full border-none bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
          allow="autoplay; fullscreen; clipboard-read; clipboard-write"
        ></iframe>
      {:else}
        <div class="p-6 text-gray-500 flex items-center justify-center h-full">Loading proxy engine...</div>
      {/if}
    {/if}
  </div>
  <div class="flex items-center gap-2 px-3 py-2  bg-[rgba(30,30,30,0.95)] border-t border-ios-sep">
    {#if state.showInput}
      <input bind:value={state.inputUrl} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && state.navigate()}
        class="flex-1 h-9 rounded-[10px] bg-ios-fill border-none text-white px-3 text-[15px] outline-none" />
      <button class="bg-transparent border-none text-ios-blue text-[15px] font-medium cursor-pointer" onclick={() => state.navigate()}>Go</button>
    {:else}
      <button class="flex-1 h-9 rounded-[10px] bg-ios-fill flex items-center justify-center text-ios-label2 text-[15px] cursor-pointer border-none" onclick={() => state.toggleInput()}>
        {state.url.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 40)}
      </button>
    {/if}
  </div>
</div>
