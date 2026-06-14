<script lang="ts">
  import { systemGlobalState } from '$lib/core/states';
  import { settingsGlobalState } from '$lib/apps/Settings/SettingsGlobalState.svelte';
  import { Signal, Wifi } from '@lucide/svelte';

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?(AM|PM)/, '');
  }
</script>

<div class="absolute top-0 left-0 right-0 h-8 mt-1 flex items-center justify-between px-6 z-9000 pointer-events-none text-white mix-blend-difference">
  <span class="text-[16px] font-semibold tracking-wide">{formatTime(systemGlobalState.currentTime)}</span>
  <div class="flex items-center gap-1.5">
    <Signal size={14} strokeWidth={2.5} />
    {#if settingsGlobalState.data?.wifi}
      <Wifi size={14} strokeWidth={2.5} />
    {/if}
    <div class="flex items-center gap-0.75">
      <div class="w-6.25 h-3 border-[1.5px] border-white/85 rounded-[3px] p-px relative after:content-[''] after:absolute after:-right-1 after:top-1/2 after:-translate-y-1/2 after:w-0.5 after:h-1.25 after:bg-white/85 after:rounded-r-sm">
        <div class="h-full bg-ios-green rounded-[1.5px] transition-all duration-300" style:width="{settingsGlobalState.data?.batteryLevel || 100}%"></div>
      </div>
      <span class="text-[11px] font-medium">{settingsGlobalState.data?.batteryLevel || 100}</span>
    </div>
  </div>
</div>
