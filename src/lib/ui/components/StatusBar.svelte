<script lang="ts">
  import { systemState } from '$lib/states';
  import { settingsState } from '$lib/apps/Settings/SettingsState.svelte';
  import { Signal, Wifi } from '@lucide/svelte';

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?(AM|PM)/, '');
  }
</script>

<div class="absolute top-0 left-0 right-0 h-13.5 flex items-end justify-between px-9.5 pb-2 z-50 pointer-events-none text-white mix-blend-difference">
  <span class="text-[16px] font-semibold tracking-wide">{formatTime(systemState.currentTime)}</span>
  <div class="flex items-center gap-1.5">
    <Signal size={14} strokeWidth={2.5} />
    {#if settingsState.wifi}
      <Wifi size={14} strokeWidth={2.5} />
    {/if}
    <div class="flex items-center gap-0.75">
      <div class="w-6.25 h-3 border-[1.5px] border-white/85 rounded-[3px] p-px relative after:content-[''] after:absolute after:-right-1 after:top-1/2 after:-translate-y-1/2 after:w-0.5 after:h-1.25 after:bg-white/85 after:rounded-r-sm">
        <div class="h-full bg-ios-green rounded-[1.5px] transition-all duration-300" style="width: {settingsState.batteryLevel}%"></div>
      </div>
      <span class="text-[11px] font-medium">{settingsState.batteryLevel}</span>
    </div>
  </div>
</div>
