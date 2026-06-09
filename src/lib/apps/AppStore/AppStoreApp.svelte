<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    Gamepad2, CalendarDays, Smartphone, Search 
  } from '@lucide/svelte';
  import { AppStoreState } from './AppStoreState.svelte';
  import Skeleton from '$lib/components/ui/Skeleton.svelte';

  const state = new AppStoreState();

  onMount(() => {
    state.init();
  });

  const tabItems: { id: any; label: string; icon: any }[] = [
    { id: 'today', label: 'Today', icon: CalendarDays },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'apps', label: 'Apps', icon: Smartphone },
    { id: 'search', label: 'Search', icon: Search },
  ];
</script>

<div class="h-full pt-13.5 pb-0 bg-black flex flex-col ">
  <div class="flex-1 overflow-y-auto px-4 ">
    <div class="px-1 py-2 pb-4">
      <span class="text-[13px] text-ios-label2 uppercase tracking-wider font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      <h1 class="text-[34px] font-bold text-white mt-0.5">Today</h1>
    </div>
    <div class="flex flex-col gap-4 mb-6">
      {#if state.loading}
        {#each Array(2) as _}
          <div class="rounded-2xl overflow-hidden bg-ios-bg2 flex flex-col">
            <Skeleton height="180px" borderRadius="0" />
            <div class="p-3">
              <Skeleton height="12px" width="60px" class="mb-2" />
              <Skeleton height="24px" width="150px" class="mb-1" />
              <Skeleton height="16px" width="100px" />
            </div>
          </div>
        {/each}
      {:else}
        {#each state.featured as app}
          <div class="rounded-2xl overflow-hidden bg-ios-bg2">
            <img src={app.img} alt={app.name} class="w-full h-45 object-cover" />
            <div class="p-3"><div class="text-[11px] text-ios-label2 uppercase tracking-wider font-semibold">{app.cat}</div><div class="text-[20px] font-bold text-white">{app.name}</div><div class="text-[13px] text-ios-label2">{app.dev}</div></div>
          </div>
        {/each}
      {/if}
    </div>
    <h2 class="text-[22px] font-bold text-white mb-3 px-1">Top Free Apps</h2>
    {#if state.loading}
      <div class="bg-ios-bg2 rounded-xl overflow-hidden">
        {#each Array(5) as _, i}
          <div class="flex items-center gap-3 p-2.5 px-4">
            <Skeleton width="16px" height="20px" class="w-4" />
            <div class="w-12 h-12 rounded-xl overflow-hidden shrink-0">
              <Skeleton width="100%" height="100%" borderRadius="12px" />
            </div>
            <div class="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
              <Skeleton height="18px" width="70%" />
              <Skeleton height="14px" width="40%" />
            </div>
            <Skeleton width="60px" height="28px" borderRadius="9999px" />
          </div>
          {#if i < 4}<div class="h-px bg-ios-sep ml-19"></div>{/if}
        {/each}
      </div>
    {:else}
      <div class="bg-ios-bg2 rounded-xl overflow-hidden">
        {#each state.topApps as app, i}
          <div class="flex items-center gap-3 p-2.5 px-4">
            <span class="text-[17px] text-ios-label2 w-4 text-right font-medium">{app.rank}</span>
            <div class="w-12 h-12 rounded-xl overflow-hidden bg-ios-fill flex items-center justify-center shrink-0">
              <img src={app.img} alt={app.name} class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0"><div class="text-[17px] text-white truncate">{app.name}</div><div class="text-[13px] text-ios-label2">{app.cat}</div></div>
            <button class="px-4 py-1.5 rounded-full bg-ios-fill border-none text-ios-blue text-[15px] font-semibold cursor-pointer">GET</button>
          </div>
          {#if i < state.topApps.length - 1}<div class="h-px bg-ios-sep ml-19"></div>{/if}
        {/each}
      </div>
    {/if}
  </div>
  <div class="flex bg-[rgba(30,30,30,0.95)] backdrop-blur-[20px] border-t border-ios-sep pt-1.5 pb-8 shrink-0 justify-around">
    {#each tabItems as t}
      <button class="flex-1 flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer py-1 {state.tab === t.id ? 'text-ios-blue' : 'text-ios-label2'}" onclick={() => state.tab = t.id}>
        <t.icon size={24} />
        <span class="text-[10px] font-medium">{t.label}</span>
      </button>
    {/each}
  </div>
</div>
