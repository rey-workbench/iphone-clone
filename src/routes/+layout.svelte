<script lang="ts">
  import "../app.css";
  import { pwaInfo } from 'virtual:pwa-info';
  import { initGlobalContexts } from "$lib/os/states";
  initGlobalContexts();

  import PwaInstallPrompt from '$lib/os/components/PwaInstallPrompt.svelte';
  
  import StatusBar from "$lib/os/components/StatusBar.svelte";
  import { systemGlobalState } from "$lib/os/states";
  import LoginScreen from "$lib/os/components/LoginScreen.svelte";
  import NotificationBanner from "$lib/os/components/NotificationBanner.svelte";

  import { callState } from "$lib/apps/Phone/CallAppState.svelte";
  import IncomingCallScreen from "$lib/apps/Phone/components/IncomingCallScreen.svelte";
  import ActiveCallScreen from "$lib/apps/Phone/components/ActiveCallScreen.svelte";
  import DialogModal from "$lib/os/components/DialogModal.svelte";
  import AppSwitcher from "$lib/os/components/AppSwitcher.svelte";
  import ControlCenter from "$lib/os/components/ControlCenter.svelte";
  import { ShellState } from "./ShellState.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  // App Registry for the App Switcher to render previews
  import { appsRegistry } from "$lib/apps/registry";
  const appComponents = appsRegistry;

  const state = new ShellState();

  let { children } = $props();

  $effect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      (async () => {
        try {
          const { registerSW } = await import('virtual:pwa-register');
          registerSW({
            immediate: true,
            onRegistered(r: any) {},
            onRegisterError(error: any) {
              // console.error('SW Registration Error:', error);
            }
          });
        } catch (e) {
          // console.error('PWA registration failed', e);
        }
      })();
    }
  });


  $effect(() => {
    if (systemGlobalState.currentUser) {
      callState.init();
    }
  });

  import { afterNavigate } from "$app/navigation";
  afterNavigate(({ to }) => {
    if (to && to.route.id && to.route.id !== '/') {
      const appId = to.route.id.replace('/', '');
      if (appId && appId.length > 0) {
        systemGlobalState.addRecentApp(appId);
      }
    }
  });

  // Global override for closing an app via gesture: instead of state.closeApp(), we route to '/'
  function handleGoHome() {
    if ($page.url.pathname !== '/') {
      // It's a route, so navigate home
      goto('/');
    }
    // Let shellState clear any internal transition states if needed
    state.closeApp(); 
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (state.isAppSwiping) {
      state.handleAppSwipeMove(e);
    }
    if (state.isControlCenterDragging) {
      state.handleControlCenterSwipeMove(e);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (state.isAppSwiping) {
      state.handleAppSwipeEnd(() => handleGoHome());
    }
    if (state.isControlCenterDragging) {
      state.handleControlCenterSwipeEnd();
    }
  };

  const handleControlCenterStart = (e: Event) => state.handleControlCenterSwipeStart(e as PointerEvent);

  const handleLockTouchStart = (e: Event) => state.handleLockTouchStart(e as TouchEvent);
  const handleLockTouchMove = (e: Event) => state.handleLockTouchMove(e as TouchEvent);
  const handleLockTouchEnd = () => state.handleLockTouchEnd();
  const handleLockClick = () => state.handleLockClick();
  const handleLockKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") state.handleLockClick();
  };

  const handleAppSwipeStart = (e: Event) => state.handleAppSwipeStart(e as any);
</script>

<svelte:head>
  {#if pwaInfo && pwaInfo.webManifest}
    <link rel="manifest" href={pwaInfo.webManifest.href} crossorigin="use-credentials" />
  {/if}
  <title>IPhone</title>
</svelte:head>

<svelte:window 
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
/>

<div class="w-screen h-dvh flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
  <div class="relative w-98.25 h-213 rounded-[48px] overflow-hidden bg-black shadow-[0_0_0_2px_#333,0_0_0_4px_#1a1a1a,0_0_60px_rgba(0,0,0,0.5),0_0_120px_rgba(0,0,0,0.3)] border border-white/5 max-[430px]:w-screen max-[430px]:h-dvh max-[430px]:rounded-none max-[430px]:shadow-none max-[430px]:border-none">
    
    <!-- Notch -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-3xl z-10000"></div>

    <div 
      class="absolute top-0 right-0 w-24 h-10 z-10001 touch-none"
      onpointerdown={handleControlCenterStart}
      ontouchstart={handleControlCenterStart}
      role="presentation"
    ></div>

    <!-- MAIN OS CONTENT AREA -->
    {#if !systemGlobalState.isInitializing}
      
      <!-- Music App Background Process -->
      <div
        class="absolute inset-0 bg-black flex-col hidden"
        style:display="none"
      >
        <!-- We will handle Music Background audio separately or let it run when mounted -->
      </div>

      <!-- Current App or Home Screen via SvelteKit Routing -->
      <!-- We use a wrapper for the swipe-to-close effect on apps -->
      <div
        class="absolute inset-0 z-50 flex flex-col {$page.url.pathname !== '/' && !state.showAppSwitcher ? 'bg-black' : ''} {state.appTransition && $page.url.pathname !== '/'
          ? 'animate-[appClose_0.3s_cubic-bezier(0.23,1,0.32,1)_forwards]'
          : $page.url.pathname !== '/' && !state.appTransition
            ? 'animate-[appOpen_0.35s_cubic-bezier(0.23,1,0.32,1)]'
            : ''}"
        style:display={!state.showAppSwitcher ? 'flex' : 'none'}
        style:transform={$page.url.pathname !== '/' && state.isAppSwiping ? `scale(${Math.max(0.465, 1 - state.appSwipeY / 500)}) translateY(-${state.appSwipeY * 0.6}px)` : ($page.url.pathname !== '/' && !state.appTransition) ? 'scale(1) translateY(0)' : undefined}
        style:border-radius={$page.url.pathname !== '/' && state.isAppSwiping ? `${Math.min(state.appSwipeY / 2, 48)}px` : ($page.url.pathname !== '/' && !state.appTransition) ? '0' : undefined}
        style:overflow={$page.url.pathname !== '/' && state.isAppSwiping ? 'hidden' : ($page.url.pathname !== '/' && !state.appTransition) ? 'hidden' : undefined}
        style:transition={$page.url.pathname !== '/' && state.isAppSwiping ? 'none' : ($page.url.pathname !== '/' && !state.appTransition) ? 'all 0.3s cubic-bezier(0.23,1,0.32,1)' : undefined}
      >
        <div class="flex-1 overflow-hidden relative flex flex-col">
          <div class="flex-1 overflow-hidden relative">
            {@render children()}
          </div>
        </div>
      </div>
    {/if}

    <!-- Lock Screen Overlay -->
    {#if !systemGlobalState.isInitializing && systemGlobalState.currentUser && state.showLockScreen}
      <div
        class="absolute inset-0 z-150 cursor-pointer transition-opacity duration-300"
        style:transform="translateY(-{state.lockScreenY}px)" style:opacity={1 - state.lockScreenY / 400}
        ontouchstart={handleLockTouchStart}
        ontouchmove={handleLockTouchMove}
        ontouchend={handleLockTouchEnd}
        onclick={handleLockClick}
        onkeydown={handleLockKeydown}
        role="button"
        tabindex="0"
      >
        <div class="absolute inset-0 bg-linear-to-b from-[#1a1040] via-[#4a2c8a] via-45% to-[#f0c0a0]"></div>
        <div class="relative z-10 h-full flex flex-col items-center">
          <div class="text-center" style:margin-top="110px">
            <div class="text-lg font-medium text-white/85 tracking-wide">
              {state.formatDate(systemGlobalState.currentTime)}
            </div>
            <div class="text-[82px] font-bold text-white leading-none mt-1 tracking-[-2px]">
              {state.formatLockTime(systemGlobalState.currentTime)}
            </div>
          </div>
          <div class="absolute bottom-10 animate-[bounceUp_2s_ease-in-out_infinite]">
            <div class="w-33.5 h-1.25 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Login Screen Overlay -->
    {#if !systemGlobalState.isInitializing && !systemGlobalState.currentUser}
      <div class="absolute inset-0 z-200">
        <LoginScreen />
      </div>
    {/if}

    <!-- Initialization Screen Overlay (Topmost) -->
    {#if systemGlobalState.isInitializing}
      <div class="absolute inset-0 bg-[#0a0a0a] z-1000"></div>
    {/if}

    {#if !systemGlobalState.isInitializing && systemGlobalState.currentUser}
      <!-- Global Status Bar -->
      <StatusBar />

      <!-- Global Home Indicator Button -->
      {#if !state.showLockScreen}
        <button
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-10 max-[430px]:h-[calc(2.5rem+env(safe-area-inset-bottom))] z-9000 bg-transparent border-none cursor-pointer flex flex-col justify-end items-center pb-3 max-[430px]:pb-[max(12px,env(safe-area-inset-bottom))] outline-none touch-none"
          onclick={handleGoHome}
          ontouchstart={handleAppSwipeStart}
          onpointerdown={handleAppSwipeStart}
          aria-label="Home"
        >
          <div class="w-33.5 h-1.25 bg-white/30 rounded-full pointer-events-none"></div>
        </button>
      {/if}

      <AppSwitcher shellState={state} {appComponents} />
    {/if}

    <!-- Global WebRTC Audio Element -->
    <audio
      id="remote-audio"
      autoplay
      playsinline
      style:position="absolute" style:width="0" style:height="0" style:opacity="0" style:pointer-events="none"
    ></audio>

    <!-- Global Call Overlays (Always accessible) -->
    {#if callState.status === "incoming"}
      <IncomingCallScreen />
    {:else if callState.status === "calling" || callState.status === "active"}
      <ActiveCallScreen />
    {/if}

    <!-- Global Dialog Overlays -->
    <DialogModal />

    <!-- Global Notification Banner -->
    <NotificationBanner />

    <!-- Control Center Overlay -->
    <ControlCenter shellState={state} />

    <PwaInstallPrompt />
  </div>
</div>
