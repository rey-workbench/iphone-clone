<script lang="ts" module>
  import type { Component } from 'svelte';
  export type ContextMenuItem = {
    label: string;
    icon?: Component<any>;
    iconColor?: string;
    textClass?: string;
    onClick: (e: MouseEvent) => void;
  };
</script>

<script lang="ts">
  let { items, style = '', onClose }: {
    items: ContextMenuItem[];
    style?: string;
    onClose: () => void;
  } = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div 
  class="absolute w-[250px] bg-[#252525] rounded-2xl overflow-hidden flex flex-col divide-y divide-[#3C3C3E] shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-110"
  {style}
  onclick={(e) => e.stopPropagation()}
>
  {#each items as item}
    <button 
      class="flex items-center justify-between px-4 py-3.5 bg-transparent border-none text-[17px] text-left hover:bg-[#333] cursor-pointer {item.textClass || 'text-white'}" 
      onclick={(e) => { e.stopPropagation(); item.onClick(e); onClose(); }}
    >
      <span>{item.label}</span>
      {#if item.icon}
        {@const Icon = item.icon}
        <Icon size={20} color={item.iconColor || '#fff'} />
      {/if}
    </button>
  {/each}
</div>
