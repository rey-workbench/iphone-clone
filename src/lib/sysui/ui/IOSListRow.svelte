<script lang="ts">
  import type { Snippet } from 'svelte';
  import { ChevronRight } from '@lucide/svelte';

  const { 
    iconSlot,
    title,
    detail,
    onClick,
    showChevron = true,
    showSeparator = true,
    paddingClass = "py-2 px-4"
  } = $props<{ 
    iconSlot?: Snippet,
    title: string | Snippet,
    detail?: string | Snippet,
    onClick?: (e: MouseEvent) => void,
    showChevron?: boolean,
    showSeparator?: boolean,
    paddingClass?: string
  }>();

</script>

{#snippet content()}
  {#if iconSlot}
    {@render iconSlot()}
  {/if}
  
  <div class="flex-1 flex justify-between items-center text-[17px]">
    {#if typeof title === 'string'}
      <span>{title}</span>
    {:else}
      {@render title()}
    {/if}

    {#if detail || showChevron}
      <div class="flex items-center gap-1">
        {#if typeof detail === 'string'}
          <span class="text-[17px] text-ios-label2">{detail}</span>
        {:else if detail}
          {@render detail()}
        {/if}
        {#if showChevron}
          <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

{#if onClick}
  <button 
    class="flex items-center gap-3 w-full border-none bg-transparent text-left text-white {paddingClass} cursor-pointer active:bg-[rgba(255,255,255,0.1)] transition-colors" 
    onclick={onClick}
  >
    {@render content()}
  </button>
{:else}
  <div class="flex items-center gap-3 w-full border-none bg-transparent text-left text-white {paddingClass}">
    {@render content()}
  </div>
{/if}
{#if showSeparator}
  <div class="h-px bg-ios-sep ml-13"></div>
{/if}
