<script lang="ts">
  import { settingsState } from '$lib/apps/Settings/SettingsState.svelte';
  import { ChevronRight } from '@lucide/svelte';
  import { AppSettingsState } from './SettingsState.svelte';
  import LinkedDevices from './LinkedDevices.svelte';
  import SettingsRow from './components/SettingsRow.svelte';
  import { authState } from '$lib/states';
  import Skeleton from '$lib/os/components/ui/Skeleton.svelte';

  const appState = new AppSettingsState();
  let toggleItems = $derived(appState.getToggleItems(settingsState));
  
  let activeView = $state('main');
  const handleBackToMain = () => activeView = 'main';
  const handleSignOut = () => authState.logout();

  const handleToggleClick = (e: MouseEvent) => {
    const id = (e.currentTarget as HTMLElement).dataset.id;
    if (id) {
      const item = toggleItems.find(x => x.id === id);
      if (item?.toggle) appState.toggle(id);
    }
  };

  const handleGeneralClick = (e: MouseEvent) => {
    const id = (e.currentTarget as HTMLElement).dataset.id;
    if (id) activeView = id;
  };
</script>

{#if activeView === 'linked_devices'}
  <LinkedDevices onBack={handleBackToMain} />
{:else}
<div class="h-full pt-13.5 pb-5 bg-black flex flex-col ">
  <div class="px-5 pt-2 pb-1"><h1 class="text-[34px] font-bold text-white">Settings</h1></div>
  <div class="px-4 py-1.5 pb-2.5">
    <input type="text" placeholder="Search" bind:value={appState.searchText}
      class="w-full h-9 rounded-[10px] bg-ios-fill border-none text-white px-3 text-[17px] outline-none placeholder:text-ios-label2" />
  </div>
  <div class="flex-1 overflow-y-auto px-4 pb-10">
    <!-- Profile -->
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      <button class="flex items-center gap-3 p-3 px-4 w-full border-none bg-transparent cursor-pointer text-left text-white">
        {#if settingsState.isLoading}
          <Skeleton width="56px" height="56px" borderRadius="9999px" class="shrink-0" />
          <div class="flex-1 flex flex-col gap-1.5 justify-center">
            <Skeleton width="120px" height="18px" />
            <Skeleton width="160px" height="14px" />
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
        {:else}
          <div class="w-14 h-14 rounded-full bg-linear-to-br from-ios-blue to-ios-indigo flex items-center justify-center text-xl font-semibold text-white shrink-0">{appState.profile.initials}</div>
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-lg font-medium">{appState.profile.name}</span>
            <span class="text-[13px] text-ios-label2">Apple Account, iCloud & more</span>
          </div>
          <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
        {/if}
      </button>
    </div>
    <!-- Connectivity -->
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      {#each toggleItems as item, i (i)}
        <SettingsRow {item} onClick={handleToggleClick} />
        {#if i < toggleItems.length - 1}<div class="h-px bg-ios-sep ml-13"></div>{/if}
      {/each}
    </div>
    <!-- General -->
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      {#each appState.general as item, i (i)}
        <SettingsRow {item} onClick={handleGeneralClick} />
        {#if i < appState.general.length - 1}<div class="h-px bg-ios-sep ml-13"></div>{/if}
      {/each}
    </div>
    <!-- Settings -->
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      {#each appState.settings as item, i (i)}
        <SettingsRow {item} />
        {#if i < appState.settings.length - 1}<div class="h-px bg-ios-sep ml-13"></div>{/if}
      {/each}
    </div>
    
    <!-- Sign Out -->
    <div class="bg-ios-bg2 rounded-xl mb-10 overflow-hidden">
        <button class="flex items-center gap-3 py-2.75 px-4 w-full border-none bg-transparent cursor-pointer text-ios-red font-semibold justify-center text-[17px]" onclick={handleSignOut}>
          Sign Out
        </button>
    </div>
  </div>
</div>
{/if}
