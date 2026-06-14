<script lang="ts">
  import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Video, Info } from '@lucide/svelte';
  import Skeleton from '$lib/os/components/ui/Skeleton.svelte';
  import type { PhoneAppState } from '../PhoneAppState.svelte';

  const { state } = $props<{ state: PhoneAppState }>();
</script>

<div class="px-4">
  <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4">Recents</h1>
  <div class="bg-ios-bg2 rounded-xl overflow-hidden">
    {#if state.loadingRecents}
      {#each Array(5) as _, i (i)}
        <div class="flex items-center p-3 px-4">
          <div class="flex-1 flex flex-col gap-1">
            <Skeleton width="120px" height="20px" />
            <div class="flex items-center gap-1">
              <Skeleton width="60px" height="14px" />
            </div>
          </div>
          <Skeleton width="20px" height="20px" borderRadius="50%" />
        </div>
        {#if i < 4}<div class="h-px bg-ios-sep ml-4"></div>{/if}
      {/each}
    {:else if state.recents.length === 0}
      <div class="p-4 text-center text-ios-label2">No recent calls</div>
    {:else}
      {#each state.recents as call, i (i)}
        <div class="flex items-center p-3 px-4">
          <div class="flex-1 flex flex-col gap-0.5">
            <div class="flex items-center gap-1.5">
              <span class="text-[17px] font-medium {call.missed ? 'text-ios-red' : 'text-white'}">{call.name}</span>
              {#if call.isVideo}
                <Video size={14} class="text-ios-label2 mt-0.5" />
              {/if}
            </div>
            <div class="flex items-center gap-1 text-[13px] text-ios-label2">
              {#if call.type === 'incoming'}
                <PhoneIncoming size={12} />
              {:else if call.type === 'outgoing'}
                <PhoneOutgoing size={12} />
              {:else if call.type === 'missed'}
                <PhoneMissed size={12} />
              {/if}
              <span>{call.time}</span>
            </div>
          </div>
          <Info size={20} class="text-ios-blue" />
        </div>
        {#if i < state.recents.length - 1}<div class="h-px bg-ios-sep ml-4"></div>{/if}
      {/each}
    {/if}
  </div>
</div>
