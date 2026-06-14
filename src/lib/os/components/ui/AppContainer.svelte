<script lang="ts">
  import type { Snippet } from 'svelte';
  import { osMediator } from '$lib/os/mediator.svelte';

  let { 
    children, 
    appName,
    bgClass = "bg-black", 
    paddingTop = "pt-13.5",
    paddingBottom = "pb-0",
    class: extraClass = "" 
  } = $props<{ 
    children: Snippet, 
    appName?: string,
    bgClass?: string, 
    paddingTop?: string,
    paddingBottom?: string,
    class?: string 
  }>();

  $effect(() => {
    if (appName) {
      osMediator.emit({ type: 'APP_LAUNCHED', payload: { appName } });
    }

    return () => {
      if (appName) {
        osMediator.emit({ type: 'APP_SUSPENDED', payload: { appName } });
      }
    };
  });
</script>

<div class="h-full flex flex-col {bgClass} {paddingTop} {paddingBottom} {extraClass}">
  {@render children()}
</div>
