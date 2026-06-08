<script lang="ts">
  import type { AppConfig } from '$lib/types';
  import { implementedApps } from '$lib/config/apps';
  import { systemState } from '$lib/states';

  let { app }: { app: AppConfig } = $props();

  function openApp() {
    if (implementedApps.has(app.id)) {
      systemState.activeApp = app.id;
    }
  }
</script>

<button class="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer select-none w-19 active:scale-[0.88] transition-transform duration-150" onclick={openApp} id="app-{app.id}">
  <div class="w-15 h-15 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden border border-white/15 {app.customContainerClass || ''}">
    <img src={app.icon} alt={app.name} class="w-full h-full object-cover rounded-2xl {app.customIconClass || ''}" />
  </div>
  <span class="text-xs font-medium text-white drop-shadow-md max-w-18 truncate">{app.name}</span>
</button>
