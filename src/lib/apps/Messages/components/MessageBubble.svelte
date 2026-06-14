<script lang="ts">
  import type { IChatMessage } from '$lib/types';
  let { 
    msg,
    isLastInGroup,
    isFirstInGroup,
    isSelectionMode,
    isSelected,
    handleToggleSelection,
    handleMessageClick,
    handleMessageContextMenu
  }: { 
    msg: IChatMessage,
    isLastInGroup: boolean,
    isFirstInGroup: boolean,
    isSelectionMode: boolean,
    isSelected: boolean,
    handleToggleSelection: (e: MouseEvent) => void,
    handleMessageClick: (e: MouseEvent) => void,
    handleMessageContextMenu: (e: MouseEvent) => void
  } = $props();
  
  const tailRightClasses = "relative before:content-[''] before:absolute before:bottom-0 before:-right-2 before:h-5 before:w-5 before:bg-[#0a84ff] before:rounded-bl-[16px] before:-z-10 after:content-[''] after:absolute after:bottom-0 after:-right-[10px] after:w-[10px] after:h-5 after:bg-black after:rounded-bl-[10px] after:z-10";
  const tailLeftClasses = "relative before:content-[''] before:absolute before:bottom-0 before:-left-2 before:h-5 before:w-5 before:bg-[#26252A] before:rounded-br-[16px] before:-z-10 after:content-[''] after:absolute after:bottom-0 after:-left-[10px] after:w-[10px] after:h-5 after:bg-black after:rounded-br-[10px] after:z-10";
</script>

<div class="flex items-end {msg.isUser ? 'justify-end pr-2' : 'pl-2'} {isLastInGroup ? 'mb-2' : ''} {isFirstInGroup ? 'mt-1' : ''} {isSelectionMode ? 'pl-10' : ''} relative">
  {#if isSelectionMode}
    <button 
      class="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-ios-sep bg-transparent flex items-center justify-center p-0 cursor-pointer {isSelected ? 'bg-ios-blue border-none' : ''}"
      data-id={msg.id}
      onclick={handleToggleSelection}
    >
      {#if isSelected}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      {/if}
    </button>
  {/if}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div 
    class="max-w-[75%] px-3.5 py-2 rounded-[18px] text-[17px] leading-[1.3] whitespace-pre-wrap wrap-break-word relative
           {msg.isUser ? 'bg-[#0a84ff] text-white' : 'bg-[#26252A] text-white'}
           {isLastInGroup && msg.isUser && !isSelectionMode ? `${tailRightClasses} rounded-br-md` : ''}
           {isLastInGroup && !msg.isUser && !isSelectionMode ? `${tailLeftClasses} rounded-bl-md` : ''}"
    data-id={msg.id}
    data-content={msg.content}
    data-isuser={msg.isUser}
    onclick={handleMessageClick}
    oncontextmenu={handleMessageContextMenu}
  >
    {msg.content}
  </div>
</div>
