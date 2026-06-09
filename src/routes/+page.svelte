<script lang="ts">
  import StatusBar from "$lib/ui/components/StatusBar.svelte";
  import AppIcon from "$lib/ui/components/AppIcon.svelte";
  import Dock from "$lib/ui/components/Dock.svelte";
  import { systemState } from "$lib/states";
  import { homeScreenApps } from "$lib/config/apps";
  import LoginScreen from "$lib/ui/components/LoginScreen.svelte";

  import CalculatorApp from "$lib/apps/Calculator/CalculatorApp.svelte";
  import WeatherApp from "$lib/apps/Weather/WeatherApp.svelte";
  import SettingsApp from "$lib/apps/Settings/SettingsApp.svelte";
  import ClockApp from "$lib/apps/Clock/ClockApp.svelte";
  import NotesApp from "$lib/apps/Notes/NotesApp.svelte";
  import PhoneApp from "$lib/apps/Phone/PhoneApp.svelte";
  import MessagesApp from "$lib/apps/Messages/MessagesApp.svelte";
  import MusicApp from "$lib/apps/Music/MusicApp.svelte";
  import CalendarApp from "$lib/apps/Calendar/CalendarApp.svelte";
  import PhotosApp from "$lib/apps/Photos/PhotosApp.svelte";
  import SafariApp from "$lib/apps/Safari/SafariApp.svelte";
  import CameraApp from "$lib/apps/Camera/CameraApp.svelte";
  import MailApp from "$lib/apps/Mail/MailApp.svelte";
  import AppStoreApp from "$lib/apps/AppStore/AppStoreApp.svelte";
  import NetflixApp from "$lib/apps/Netflix/NetflixApp.svelte";

  import { callState } from "$lib/apps/Phone/CallState.svelte";
  import IncomingCallScreen from "$lib/apps/Phone/components/IncomingCallScreen.svelte";
  import ActiveCallScreen from "$lib/apps/Phone/components/ActiveCallScreen.svelte";
  import DialogModal from "$lib/ui/components/DialogModal.svelte";

  import { ShellState } from "./ShellState.svelte";

  const appComponents: Record<string, any> = {
    calculator: CalculatorApp,
    weather: WeatherApp,
    settings: SettingsApp,
    clock: ClockApp,
    notes: NotesApp,
    phone: PhoneApp,
    messages: MessagesApp,
    music: MusicApp,
    calendar: CalendarApp,
    photos: PhotosApp,
    safari: SafariApp,
    camera: CameraApp,
    mail: MailApp,
    appstore: AppStoreApp,
    netflix: NetflixApp,
  };

  const state = new ShellState();

  let CurrentAppComponent = $derived(
    systemState.activeApp ? appComponents[systemState.activeApp] : null,
  );

  $effect(() => {
    if (systemState.currentUser) {
      callState.init();
    }
  });
</script>

<svelte:head>
  <title>IPhone</title>
</svelte:head>

<div
  class="w-screen h-dvh flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
>
  <div
    class="relative w-98.25 h-213 rounded-[48px] overflow-hidden bg-black shadow-[0_0_0_2px_#333,0_0_0_4px_#1a1a1a,0_0_60px_rgba(0,0,0,0.5),0_0_120px_rgba(0,0,0,0.3)] border border-white/5 max-[430px]:w-screen max-[430px]:h-dvh max-[430px]:rounded-none max-[430px]:shadow-none max-[430px]:border-none"
  >
    <!-- Notch -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-3xl z-10000"
    ></div>

    {#if !systemState.currentUser}
      <LoginScreen />
    {:else if state.showLockScreen}
      <!-- Lock Screen -->
      <div
        class="absolute inset-0 z-30 cursor-pointer transition-opacity duration-300"
        style="transform: translateY(-{state.lockScreenY}px); opacity: {1 -
          state.lockScreenY / 400}"
        ontouchstart={(e) => state.handleLockTouchStart(e)}
        ontouchmove={(e) => state.handleLockTouchMove(e)}
        ontouchend={() => state.handleLockTouchEnd()}
        onclick={() => state.handleLockClick()}
        onkeydown={(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") state.handleLockClick();
        }}
        role="button"
        tabindex="0"
      >
        <div
          class="absolute inset-0 bg-linear-to-b from-[#1a1040] via-[#4a2c8a] via-45% to-[#f0c0a0]"
        ></div>
        <div class="relative z-10 h-full flex flex-col items-center">
          <StatusBar />
          <div class="text-center" style="margin-top: 110px;">
            <div class="text-lg font-medium text-white/85 tracking-wide">
              {state.formatDate(systemState.currentTime)}
            </div>
            <div
              class="text-[82px] font-bold text-white leading-none mt-1 tracking-[-2px]"
            >
              {state.formatLockTime(systemState.currentTime)}
            </div>
          </div>
          <div
            class="absolute bottom-10 animate-[bounceUp_2s_ease-in-out_infinite]"
          >
            <div class="w-33.5 h-1.25 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Music App (Always mounted to keep music playing in background) -->
      <div
        class="absolute inset-0 bg-black flex-col {state.appTransition &&
        systemState.activeApp === 'music'
          ? 'animate-[appClose_0.3s_cubic-bezier(0.23,1,0.32,1)_forwards]'
          : systemState.activeApp === 'music' && !state.appTransition
            ? 'animate-[appOpen_0.35s_cubic-bezier(0.23,1,0.32,1)]'
            : ''}"
        style="display: {systemState.activeApp === 'music' ||
        (state.appTransition && systemState.activeApp === 'music')
          ? 'flex'
          : 'none'}; z-index: 50;"
      >
        <StatusBar />
        <div class="flex-1 overflow-hidden relative flex flex-col">
          <div class="flex-1 overflow-hidden relative">
            <MusicApp />
          </div>
        </div>
        <button
          class="absolute top-0 left-1/2 -translate-x-1/2 w-35 h-5 z-200 bg-transparent border-none cursor-pointer opacity-0"
          onclick={() => state.closeApp()}
          aria-label="Close app"
        ></button>
        <button
          class="absolute bottom-2 left-1/2 -translate-x-1/2 w-33.5 h-1.25 bg-white/30 rounded-full z-100 cursor-pointer border-none"
          onclick={() => state.closeApp()}
          aria-label="Home"
        ></button>
      </div>

      {#if CurrentAppComponent && systemState.activeApp !== "music"}
        <!-- Other Active App -->
        <div
          class="absolute inset-0 z-50 bg-black flex flex-col {state.appTransition
            ? 'animate-[appClose_0.3s_cubic-bezier(0.23,1,0.32,1)_forwards]'
            : 'animate-[appOpen_0.35s_cubic-bezier(0.23,1,0.32,1)]'}"
        >
          <StatusBar />
          <div class="flex-1 overflow-hidden relative flex flex-col">
            <div class="flex-1 overflow-hidden relative">
              <CurrentAppComponent />
            </div>
          </div>
          <button
            class="absolute top-0 left-1/2 -translate-x-1/2 w-35 h-5 z-200 bg-transparent border-none cursor-pointer opacity-0"
            onclick={() => state.closeApp()}
            aria-label="Close app"
          ></button>
          <button
            class="absolute bottom-2 left-1/2 -translate-x-1/2 w-33.5 h-1.25 bg-white/30 rounded-full z-100 cursor-pointer border-none"
            onclick={() => state.closeApp()}
            aria-label="Home"
          ></button>
        </div>
      {/if}

      {#if !systemState.activeApp || state.appTransition}
        <!-- Home Screen -->
        <div
          class="absolute inset-0 flex flex-col animate-[fadeIn_0.3s_ease-out]"
        >
          <!-- Wallpaper -->
          <div class="absolute inset-0 overflow-hidden">
            <div
              class="absolute inset-0 bg-linear-to-br from-[#0f0c29] via-[#302b63] via-40% to-[#16213e]"
            ></div>
            <div
              class="absolute w-50 h-50 rounded-full top-[15%] left-[-20%] bg-gradient-radial from-[#667eea] to-[#764ba2] blur-[60px] opacity-40 animate-[orbFloat_20s_ease-in-out_infinite]"
            ></div>
            <div
              class="absolute w-45 h-45 rounded-full top-[50%] right-[-15%] bg-gradient-radial from-[#f093fb] to-[#f5576c] blur-[60px] opacity-40 animate-[orbFloat_20s_ease-in-out_infinite_-7s]"
            ></div>
            <div
              class="absolute w-37.5 h-37.5 rounded-full bottom-[20%] left-[20%] bg-gradient-radial from-[#4facfe] to-[#00f2fe] blur-[60px] opacity-40 animate-[orbFloat_20s_ease-in-out_infinite_-14s]"
            ></div>
          </div>

          <StatusBar />

          <div class="relative z-10 flex-1 flex flex-col px-4 overflow-hidden">
            <div
              class="grid grid-cols-4 justify-items-center"
              style="padding-top: 80px; gap: 32px 8px;"
            >
              {#each homeScreenApps[state.currentPage] as app}
                <AppIcon {app} />
              {/each}
            </div>
            <div
              class="flex justify-center"
              style="margin-top: auto; margin-bottom: 110px; gap: 6px;"
            >
              {#each homeScreenApps as _, i}
                <button
                  class="p-1 border-none bg-transparent cursor-pointer flex items-center justify-center"
                  onclick={() => (state.currentPage = i)}
                  aria-label="Page {i + 1}"
                >
                  <div
                    class="w-1.5 h-1.5 rounded-full transition-all duration-300 {i ===
                    state.currentPage
                      ? 'bg-white shadow-[0_0_2px_rgba(0,0,0,0.5)] scale-125'
                      : 'bg-white/40'}"
                  ></div>
                </button>
              {/each}
            </div>
          </div>

          <Dock />
          <div
            class="absolute bottom-2 left-1/2 -translate-x-1/2 w-33.5 h-1.25 bg-white/30 rounded-full z-100"
          ></div>
        </div>
      {/if}
    {/if}

    <!-- Global WebRTC Audio Element -->
    <audio
      id="remote-audio"
      autoplay
      playsinline
      style="position: absolute; width: 0; height: 0; opacity: 0; pointer-events: none;"
    ></audio>

    <!-- Global Call Overlays (Always accessible) -->
    {#if callState.status === "incoming"}
      <IncomingCallScreen />
    {:else if callState.status === "calling" || callState.status === "active"}
      <ActiveCallScreen />
    {/if}

    <!-- Global Dialog Overlays -->
    <DialogModal />
  </div>
</div>
