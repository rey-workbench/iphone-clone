<script lang="ts">
  import { settingsState } from '$lib/apps/Settings/SettingsState.svelte';
  import { ChevronRight } from '@lucide/svelte';
  import { AppSettingsState } from './SettingsState.svelte';
  import LinkedDevices from './LinkedDevices.svelte';
  import { AuthState } from '$lib/states/authState.svelte';

  const authState = new AuthState();
  const appState = new AppSettingsState();
  let toggleItems = $derived(appState.getToggleItems(settingsState));
  
  let activeView = $state('main');
</script>

{#if activeView === 'linked_devices'}
  <LinkedDevices onBack={() => activeView = 'main'} />
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
        <div class="w-14 h-14 rounded-full bg-linear-to-br from-ios-blue to-ios-indigo flex items-center justify-center text-xl font-semibold text-white shrink-0">{appState.profile.initials}</div>
        <div class="flex-1 flex flex-col gap-0.5">
          <span class="text-lg font-medium">{appState.profile.name}</span>
          <span class="text-[13px] text-ios-label2">Apple Account, iCloud & more</span>
        </div>
        <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
      </button>
    </div>
    <!-- Connectivity -->
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      {#each toggleItems as item, i}
        <button class="flex items-center gap-3 py-2.75 px-4 w-full border-none bg-transparent cursor-pointer text-white text-left" onclick={() => item.toggle && appState.toggle(item.id)}>
          <div class="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style="background:{item.bg}">
            <item.icon size={16} color="white" />
          </div>
          <div class="flex-1 text-[17px]">{item.label}</div>
          {#if item.toggle}
            <div class="w-12.75 h-7.75 rounded-2xl relative transition-colors duration-200 shrink-0 {item.value ? 'bg-ios-green' : 'bg-[#39393D]'}">
              <div class="w-6.75 h-6.75 rounded-full bg-white absolute top-0.5 left-0.5 transition-transform duration-200 shadow-md {item.value ? 'translate-x-5' : ''}"></div>
            </div>
          {:else}
            <span class="text-[15px] text-ios-label2 mr-1">{item.detail}</span>
            <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
          {/if}
        </button>
        {#if i < toggleItems.length - 1}<div class="h-px bg-ios-sep ml-13"></div>{/if}
      {/each}
    </div>
    <!-- General -->
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      {#each appState.general as item, i}
        <button class="flex items-center gap-3 py-2.75 px-4 w-full border-none bg-transparent cursor-pointer text-white text-left" onclick={() => { if(item.id) activeView = item.id; }}>
          <div class="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style="background:{item.bg}">
            <item.icon size={16} color="white" />
          </div>
          <div class="flex-1 text-[17px]">{item.label}</div>
          <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
        </button>
        {#if i < appState.general.length - 1}<div class="h-px bg-ios-sep ml-13"></div>{/if}
      {/each}
    </div>
    <!-- Settings -->
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      {#each appState.settings as item, i}
        <button class="flex items-center gap-3 py-2.75 px-4 w-full border-none bg-transparent cursor-pointer text-white text-left">
          <div class="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style="background:{item.bg}">
            <item.icon size={16} color="white" />
          </div>
          <div class="flex-1 text-[17px]">{item.label}</div>
          <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
        </button>
        {#if i < appState.settings.length - 1}<div class="h-px bg-ios-sep ml-13"></div>{/if}
      {/each}
    </div>
    
    <!-- Sign Out -->
    <div class="bg-ios-bg2 rounded-xl mb-10 overflow-hidden">
        <button class="flex items-center gap-3 py-2.75 px-4 w-full border-none bg-transparent cursor-pointer text-ios-red font-semibold justify-center text-[17px]" onclick={() => authState.logout()}>
          Sign Out
        </button>
    </div>
  </div>
</div>
{/if}
