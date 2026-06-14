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
  const { items, menuTop, menuLeft, menuRight, onClose }: {
    items: ContextMenuItem[];
    menuTop?: number;
    menuLeft?: number;
    menuRight?: number;
    onClose: () => void;
  } = $props();

  const handleContainerClick = (e: MouseEvent) => e.stopPropagation();
  const handleContainerKeyDown = (e: KeyboardEvent) => e.stopPropagation();

  const handleItemClick = (e: MouseEvent) => {
    const idx = (e.currentTarget as HTMLElement).dataset.index;
    if (idx !== undefined) {
      const item = items[parseInt(idx, 10)];
      e.stopPropagation();
      item.onClick(e);
      onClose();
    }
  };
</script>

<div 
  class="absolute w-[250px] bg-[#252525] rounded-2xl overflow-hidden flex flex-col divide-y divide-[#3C3C3E] shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-110"
  style:top={menuTop !== undefined ? `${menuTop}px` : undefined}
  style:left={menuLeft !== undefined ? `${menuLeft}px` : undefined}
  style:right={menuRight !== undefined ? `${menuRight}px` : undefined}
  role="button"
  tabindex="0"
  onclick={handleContainerClick}
  onkeydown={handleContainerKeyDown}
>
  {#each items as item, i (item.label)}
    <button 
      data-index={i}
      class="flex items-center justify-between px-4 py-3.5 bg-transparent border-none text-[17px] text-left hover:bg-[#333] cursor-pointer {item.textClass || 'text-white'}" 
      onclick={handleItemClick}
    >
      <span>{item.label}</span>
      {#if item.icon}
        {@const Icon = item.icon}
        <Icon size={20} color={item.iconColor || '#fff'} />
      {/if}
    </button>
  {/each}
</div>
