<script lang="ts">
  import { systemState } from "$lib/states";
  import { homeScreenApps } from "$lib/config/apps";
  import type { ShellState } from "../../../routes/ShellState.svelte";
  import { setContext } from "svelte";

  let { shellState, appComponents }: { shellState: ShellState, appComponents: Record<string, any> } = $props();

  setContext('isPreview', true);

  function getAppName(appId: string) {
    for (const page of homeScreenApps) {
      const app = page.find((a) => a?.id === appId);
      if (app) return app.name;
    }
    // Check dock apps
    const dockApps = [
      { id: "phone", name: "Phone" },
      { id: "safari", name: "Safari" },
      { id: "messages", name: "Messages" },
      { id: "music", name: "Music" },
    ];
    const dockApp = dockApps.find((a) => a.id === appId);
    if (dockApp) return dockApp.name;

    return appId;
  }

  function getAppIconColor(appId: string) {
    const colors: Record<string, string> = {
      calculator: "bg-orange-500",
      weather: "bg-blue-400",
      settings: "bg-gray-400",
      clock: "bg-black",
      notes: "bg-yellow-100",
      phone: "bg-green-500",
      messages: "bg-green-400",
      music: "bg-[#fa233b]",
      calendar: "bg-white",
      photos: "bg-white",
      safari: "bg-white",
      camera: "bg-gray-800",
      mail: "bg-blue-500",
      appstore: "bg-blue-500",
      netflix: "bg-black",
    };
    return colors[appId] || "bg-gray-500";
  }

  let swipedUpApps = $state<Record<string, boolean>>({});

  function handleKillApp(appId: string) {
    swipedUpApps[appId] = true;
    setTimeout(() => {
      systemState.removeRecentApp(appId);
      swipedUpApps[appId] = false; // reset
      if (systemState.recentApps.length === 0) {
        shellState.closeAppSwitcher();
      }
    }, 300);
  }

  let cardStartY = $state(0);
  let cardSwipeY = $state<Record<string, number>>({});
  let activeSwipeId = $state<string | null>(null);

  function onPointerDown(e: PointerEvent, appId: string) {
    activeSwipeId = appId;
    cardStartY = e.clientY;
    cardSwipeY[appId] = 0;
    if (e.currentTarget instanceof Element) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }

  function onPointerMove(e: PointerEvent, appId: string) {
    if (activeSwipeId !== appId) return;
    cardSwipeY[appId] = Math.max(0, cardStartY - e.clientY);
  }

  function onPointerUp(e: PointerEvent, appId: string) {
    if (activeSwipeId !== appId) return;
    activeSwipeId = null;
    if (e.currentTarget instanceof Element) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (cardSwipeY[appId] > 100) {
      handleKillApp(appId);
    } else {
      cardSwipeY[appId] = 0;
    }
  }

  function onCardClick(appId: string) {
    if (cardSwipeY[appId] > 10) return; // ignore click if swiping
    systemState.activeApp = appId;
    shellState.closeAppSwitcher();
  }
</script>

<div
  class="absolute inset-0 z-40 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center transition-all duration-300 {(shellState.showAppSwitcher || (shellState.isAppSwiping && shellState.appSwipeY > 20))
    ? 'opacity-100 pointer-events-auto'
    : 'opacity-0 pointer-events-none'}"
>
  {#if systemState.recentApps.length > 0}
    <div
      class="w-full h-[60%] flex items-center overflow-x-auto snap-x snap-mandatory px-8 gap-6 no-scrollbar pb-10"
    >
      {#each systemState.recentApps as appId (appId)}
        {#if !swipedUpApps[appId]}
          <div
            class="snap-center shrink-0 w-[200px] max-[430px]:w-[180px] h-[400px] max-[430px]:h-[360px] flex flex-col gap-3 transition-transform"
            style="transform: translateY(-{cardSwipeY[appId] ||
              0}px); transition: {activeSwipeId === appId
              ? 'none'
              : 'transform 0.3s'}; opacity: {appId === systemState.activeApp && !shellState.showAppSwitcher ? 0 : 1};"
          >
            <!-- App Card -->
            <button
              class="flex-1 w-full rounded-4xl {getAppIconColor(
                appId,
              )} shadow-2xl flex items-center justify-center relative overflow-hidden outline-none touch-pan-x border border-white/10 bg-black"
              onclick={() => onCardClick(appId)}
              onpointerdown={(e) => onPointerDown(e, appId)}
              onpointermove={(e) => onPointerMove(e, appId)}
              onpointerup={(e) => onPointerUp(e, appId)}
              onpointercancel={(e) => onPointerUp(e, appId)}
            >
              {#if appComponents && appComponents[appId]}
                {@const AppComponent = appComponents[appId]}
                <div class="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                  <div class="w-[430px] h-[932px] shrink-0" style="transform: scale(0.465); transform-origin: center;">
                    <AppComponent />
                  </div>
                </div>
              {:else}
                <span class="text-white text-xl font-semibold opacity-50 mix-blend-difference">{getAppName(appId)}</span>
              {/if}
            </button>

            <!-- App Name Below Card -->
            <div
              class="text-center text-white font-medium text-sm drop-shadow-md"
            >
              {getAppName(appId)}
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="text-white/50 text-lg font-medium">No Recent Apps</div>
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
