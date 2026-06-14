<script lang="ts">
  import type { ShellState } from "$lib/core/states/ShellState.svelte";
  import { 
    Wifi, Bluetooth, Plane, RadioTower, 
    Play, Forward, Rewind, Maximize2, 
    Moon, Lock, Copy, Sun, Volume2, 
    Flashlight, Calculator, Camera, Battery, AlarmClock
  } from "@lucide/svelte";

  const { shellState }: { shellState: ShellState } = $props();

  // Drag handlers to close the control center
  function handleTouchStart(e: TouchEvent | PointerEvent) {
    shellState.handleControlCenterSwipeStart(e);
  }
  function handleTouchMove(e: TouchEvent | PointerEvent) {
    shellState.handleControlCenterSwipeMove(e);
  }
  function handleTouchEnd() {
    shellState.handleControlCenterSwipeEnd();
  }
</script>

{#if shellState.isControlCenterOpen || shellState.isControlCenterDragging}
  {@const baseTransform = shellState.isControlCenterOpen ? '0px' : '-100%'}
  <!-- The overlay wrapper with transform to allow sliding up to dismiss -->
  <div 
    class="absolute inset-0 z-5000 transition-transform duration-300"
    style:transform="translateY(calc({baseTransform} + {shellState.controlCenterDragY}px))"
    style:transition={shellState.isControlCenterDragging ? 'none' : null}
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    onpointerdown={handleTouchStart}
    onpointermove={handleTouchMove}
    onpointerup={handleTouchEnd}
    role="presentation"
  >
    <!-- Background Blur -->
    <div class="absolute inset-0 bg-black/30 backdrop-blur-3xl animate-[fadeIn_0.3s_ease-out]"></div>

    <!-- Layout Grid -->
    <div class="relative z-10 p-6 pt-16 h-full flex flex-col gap-4 animate-[slideDown_0.35s_cubic-bezier(0.23,1,0.32,1)]" style:animation={!shellState.isControlCenterOpen && !shellState.isControlCenterDragging ? 'none' : null}>
      
      <!-- Top Section -->
      <div class="flex gap-4 h-44">
        
        <!-- Network Block -->
        <div class="flex-1 bg-white/10 backdrop-blur-xl rounded-[28px] p-4 flex flex-col justify-between shadow-lg">
          <div class="flex justify-between">
            <button class="w-[52px] h-[52px] rounded-full bg-[#0A84FF] flex items-center justify-center border-none shadow-sm" aria-label="Toggle Airplane Mode"><Plane color="white" size={24} fill="white" /></button>
            <button class="w-[52px] h-[52px] rounded-full bg-ios-green flex items-center justify-center border-none shadow-sm" aria-label="Toggle Cellular"><RadioTower color="white" size={24} /></button>
          </div>
          <div class="flex justify-between">
            <button class="w-[52px] h-[52px] rounded-full bg-[#0A84FF] flex items-center justify-center border-none shadow-sm" aria-label="Toggle Wi-Fi"><Wifi color="white" size={24} /></button>
            <button class="w-[52px] h-[52px] rounded-full bg-[#0A84FF] flex items-center justify-center border-none shadow-sm" aria-label="Toggle Bluetooth"><Bluetooth color="white" size={24} /></button>
          </div>
        </div>

        <!-- Media Block -->
        <div class="flex-1 bg-white/10 backdrop-blur-xl rounded-[28px] p-4 shadow-lg flex flex-col">
          <div class="flex justify-end">
            <button class="p-1 rounded-full bg-white/20 border-none" aria-label="Maximize Media Controls"><Maximize2 color="white" size={16}/></button>
          </div>
          <div class="flex-1 flex items-center justify-center">
            <span class="text-white/60 font-medium text-sm">Tidak Diputar</span>
          </div>
          <div class="flex justify-center gap-6 pb-2">
            <button class="bg-transparent border-none" aria-label="Previous Track"><Rewind color="white" size={22} fill="white" /></button>
            <button class="bg-transparent border-none" aria-label="Play/Pause"><Play color="white" size={26} fill="white" /></button>
            <button class="bg-transparent border-none" aria-label="Next Track"><Forward color="white" size={22} fill="white" /></button>
          </div>
        </div>
      </div>

      <!-- Middle Section -->
      <div class="flex gap-4 h-40">
        <!-- 2x2 Toggles -->
        <div class="flex-1 flex flex-col gap-4">
          <div class="flex gap-4 flex-1">
            <button class="flex-1 bg-white backdrop-blur-xl rounded-[20px] flex items-center justify-center border-none shadow-lg text-ios-red" aria-label="Rotation Lock"><Lock size={28} /></button>
            <button class="flex-1 bg-white/10 backdrop-blur-xl rounded-[20px] flex items-center justify-center border-none shadow-lg text-white" aria-label="Screen Mirroring"><Copy size={28} /></button>
          </div>
          <div class="bg-white/10 backdrop-blur-xl rounded-[20px] p-3 flex items-center gap-3 shadow-lg flex-1 border-none justify-start">
            <div class="w-9 h-9 rounded-full bg-ios-indigo flex items-center justify-center shrink-0">
              <Moon color="white" size={20} fill="white" />
            </div>
            <div class="flex flex-col items-start leading-tight">
              <span class="text-white font-medium text-[15px]">Jangan Ganggu</span>
              <span class="text-white/60 text-xs">Nyala</span>
            </div>
          </div>
        </div>

        <!-- Brightness Slider -->
        <div class="w-[84px] bg-white/10 backdrop-blur-xl rounded-[28px] shadow-lg relative overflow-hidden flex flex-col justify-end">
          <div class="absolute inset-x-0 bottom-0 bg-white h-[60%]"></div>
          <div class="relative z-10 w-full pb-4 flex justify-center text-black/50">
            <Sun size={26} />
          </div>
        </div>

        <!-- Volume Slider -->
        <div class="w-[84px] bg-white/10 backdrop-blur-xl rounded-[28px] shadow-lg relative overflow-hidden flex flex-col justify-end">
          <div class="absolute inset-x-0 bottom-0 bg-white h-[40%]"></div>
          <div class="relative z-10 w-full pb-4 flex justify-center text-black/50">
            <Volume2 size={26} />
          </div>
        </div>
      </div>

      <!-- Bottom Utilities -->
      <div class="grid grid-cols-4 gap-4 mt-2">
        <button class="aspect-square bg-white/10 backdrop-blur-xl rounded-[20px] flex items-center justify-center border-none shadow-lg text-white" aria-label="Flashlight"><Flashlight size={28} /></button>
        <button class="aspect-square bg-white/10 backdrop-blur-xl rounded-[20px] flex items-center justify-center border-none shadow-lg text-white" aria-label="Timer"><AlarmClock size={28} /></button>
        <button class="aspect-square bg-white/10 backdrop-blur-xl rounded-[20px] flex items-center justify-center border-none shadow-lg text-white" aria-label="Calculator"><Calculator size={28} /></button>
        <button class="aspect-square bg-white/10 backdrop-blur-xl rounded-[20px] flex items-center justify-center border-none shadow-lg text-white" aria-label="Camera"><Camera size={28} /></button>
        
        <button class="aspect-square bg-white/10 backdrop-blur-xl rounded-[20px] flex items-center justify-center border-none shadow-lg text-white" aria-label="Screen Recording">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-2H8L6 7H5a2 2 0 0 0-2 2z"></path><circle cx="12" cy="13" r="3"></circle></svg>
        </button>
        <button class="aspect-square bg-white/10 backdrop-blur-xl rounded-[20px] flex items-center justify-center border-none shadow-lg text-white" aria-label="Dark Mode">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
        <button class="aspect-square bg-white/10 backdrop-blur-xl rounded-[20px] flex items-center justify-center border-none shadow-lg text-white" aria-label="Low Power Mode"><Battery size={28} /></button>
        <button class="aspect-square bg-white/10 backdrop-blur-xl rounded-[20px] flex items-center justify-center border-none shadow-lg text-white" aria-label="Notes">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
        </button>
        
        <button class="aspect-square bg-white/10 backdrop-blur-xl rounded-[20px] flex items-center justify-center border-none shadow-lg text-white" aria-label="Accessibility">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
        </button>
      </div>

    </div>
  </div>
{/if}

<style>
  @keyframes slideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
</style>
