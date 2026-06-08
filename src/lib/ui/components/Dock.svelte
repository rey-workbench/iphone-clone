<script lang="ts">
  import AppIcon from './AppIcon.svelte';
  import { dockApps } from '$lib/config/apps';
</script>

<div class="absolute bottom-0 left-0 right-0 px-2.5 pb-10 z-20">
  <div class="flex justify-evenly items-center px-4 py-3 pb-2.5 bg-[rgba(30,30,30,0.55)] backdrop-blur-2xl rounded-[28px] border border-white/8">
    {#each dockApps as app}
      <AppIcon {app} />
    {/each}
  </div>
</div>
