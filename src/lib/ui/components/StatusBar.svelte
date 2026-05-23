<script lang="ts">
  import { systemState, settingsState } from '$lib/states';
  import { Signal, Wifi } from '@lucide/svelte';

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?(AM|PM)/, '');
  }
</script>

<div class="absolute top-0 left-0 right-0 h-[54px] flex items-end justify-between pb-2 z-500 pointer-events-none text-white mix-blend-difference" style="padding-left: 38px; padding-right: 38px;">
  <span class="text-[16px] font-semibold tracking-wide">{formatTime(systemState.currentTime)}</span>
  <div class="flex items-center gap-1.5">
    <Signal size={14} strokeWidth={2.5} />
    {#if settingsState.wifi}
      <Wifi size={14} strokeWidth={2.5} />
    {/if}
    <div class="flex items-center gap-[3px]">
      <div class="w-[25px] h-3 border-[1.5px] border-white/85 rounded-[3px] p-px relative after:content-[''] after:absolute after:right-[-4px] after:top-1/2 after:-translate-y-1/2 after:w-[2px] after:h-[5px] after:bg-white/85 after:rounded-r-sm">
        <div class="h-full bg-ios-green rounded-[1.5px] transition-all duration-300" style="width: {settingsState.batteryLevel}%"></div>
      </div>
      <span class="text-[11px] font-medium">{settingsState.batteryLevel}</span>
    </div>
  </div>
</div>
