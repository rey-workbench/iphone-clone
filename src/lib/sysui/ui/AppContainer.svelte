<script lang="ts">
  import type { Snippet } from 'svelte';
  import { intentManager } from '$lib/core/IntentManager';

  const { 
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
      intentManager.send('APP_LAUNCHED', { appName });
    }

    return () => {
      if (appName) {
        intentManager.send('APP_SUSPENDED', { appName });
      }
    };
  });
</script>

<div class="h-full flex flex-col {bgClass} {paddingTop} {paddingBottom} {extraClass}">
  {@render children()}
</div>
