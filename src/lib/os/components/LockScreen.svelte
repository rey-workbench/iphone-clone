<script lang="ts">
  import type { ShellState } from "../../../routes/ShellState.svelte";


  const { state, systemGlobalState }: { state: ShellState, systemGlobalState: any } = $props();

  const handleLockTouchStart = (e: Event) => state.handleLockTouchStart(e as TouchEvent);
  const handleLockTouchMove = (e: Event) => state.handleLockTouchMove(e as TouchEvent);
  const handleLockTouchEnd = () => state.handleLockTouchEnd();
  const handleLockClick = () => state.handleLockClick();
  const handleLockKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") state.handleLockClick();
  };
</script>

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
