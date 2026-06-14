<script lang="ts">
  import type { IAppConfig } from '$lib/types';
  import { implementedApps } from '$lib/config/apps';
  import { messagesState } from '$lib/apps/Messages/MessagesAppState.svelte';
  import { goto } from '$app/navigation';

  const { app }: { app: IAppConfig } = $props();

  function openApp() {
    if (implementedApps.has(app.id)) {
      goto('/' + app.id);
    }
  }
</script>

<button class="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer select-none w-19 active:scale-[0.88] transition-transform duration-150 relative" onclick={openApp} id="app-{app.id}">
  <div class="w-15 h-15 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden border border-white/15 {app.customContainerClass || ''}">
    <img src={app.icon} alt={app.name} class="w-full h-full object-cover rounded-2xl {app.customIconClass || ''}" />
  </div>
  
  {#if app.id === 'messages' && messagesState.totalUnread > 0}
    <div class="absolute -top-1.5 right-0.5 w-6 h-6 bg-ios-red text-white text-[13px] font-semibold flex items-center justify-center rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-white/20 z-10 animate-[appOpen_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)]">
      {messagesState.totalUnread > 99 ? '99+' : messagesState.totalUnread}
    </div>
  {/if}

  <span class="text-xs font-medium text-white drop-shadow-md max-w-18 truncate">{app.name}</span>
</button>
