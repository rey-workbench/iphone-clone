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

<button class="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer select-none w-[76px] active:scale-[0.88] transition-transform duration-150" onclick={openApp} id="app-{app.id}">
  <div class="w-[60px] h-[60px] rounded-[14px] flex items-center justify-center shadow-lg relative overflow-hidden border border-white/15">
    <img src={app.icon} alt={app.name} class="w-full h-full object-cover rounded-[14px]" />
  </div>
  <span class="text-[11px] font-medium text-white drop-shadow-md max-w-[72px] truncate">{app.name}</span>
</button>
