<script lang="ts">
  import type { Snippet } from 'svelte';

  const { 
    title,
    rightSlot,
    leftSlot,
    bgClass = "bg-transparent",
    textClass = "text-white",
    paddingClass = "px-5 pt-2 pb-1"
  } = $props<{ 
    title: string,
    rightSlot?: Snippet,
    leftSlot?: Snippet,
    bgClass?: string,
    textClass?: string,
    paddingClass?: string
  }>();
</script>

<div class="{paddingClass} flex justify-between items-center {bgClass}">
  {#if leftSlot}
    {@render leftSlot()}
  {/if}
  <h1 class="text-[34px] font-bold {textClass} m-0 flex-1">{title}</h1>
  {#if rightSlot}
    {@render rightSlot()}
  {/if}
</div>
