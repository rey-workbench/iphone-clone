<script lang="ts">
  import type { Snippet } from 'svelte';

  let { 
    children, 
    bgClass = "bg-black", 
    paddingTop = "pt-13.5",
    paddingBottom = "pb-0",
    class: extraClass = "" 
  } = $props<{ 
    children: Snippet, 
    bgClass?: string, 
    paddingTop?: string,
    paddingBottom?: string,
    class?: string 
  }>();
</script>

<div class="h-full flex flex-col {bgClass} {paddingTop} {paddingBottom} {extraClass}">
  {@render children()}
</div>
