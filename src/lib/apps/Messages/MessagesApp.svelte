<script lang="ts">
  import { Copy, Reply, Trash2, MoreHorizontal, Undo2 } from '@lucide/svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { messagesState as appState } from './MessagesAppState.svelte';
  import { usersGlobalState } from '$lib/core/states';
  import Skeleton from '$lib/sysui/ui/Skeleton.svelte';
  import { type ContextMenuItem } from '$lib/sysui/ui/ContextMenu.svelte';
  import MessagesChatHeader from './components/MessagesChatHeader.svelte';
  import MessagesInputBar from './components/MessagesInputBar.svelte';
  import MessagesContextMenu from './components/MessagesContextMenu.svelte';
  import MessageBubble from './components/MessageBubble.svelte';
  import ConversationItem from './components/ConversationItem.svelte';
  import TypingIndicator from './components/TypingIndicator.svelte';
  import MessagesSearchBar from './components/MessagesSearchBar.svelte';

  let chatEl: HTMLDivElement | null = $state(null);
  
  let activeContextMenu: {
    msgId: string;
    isUser: boolean;
    content: string;
    rect: DOMRect;
    winWidth: number;
    winHeight: number;
  } | null = $state(null);

  let isSelectionMode = $state(false);
  let selectedMessages: SvelteSet<string> = new SvelteSet();
  let keyboardPadding = $state(0);

  $effect(() => {
    if (appState.messages.length > 0 && chatEl) {
      const id = setTimeout(() => {
        if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
      }, 50);
      return () => clearTimeout(id);
    }
  });

  $effect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;
    const onResize = () => {
      const diff = window.innerHeight - visualViewport.height;
      keyboardPadding = diff > 0 ? diff : 0;
      if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
    };
    visualViewport.addEventListener('resize', onResize);
    onResize();
    return () => visualViewport.removeEventListener('resize', onResize);
  });

  function adjustTextareaHeight(e: Event) {
    const el = e.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }
  
  function getMenuItems(): ContextMenuItem[] {
    if (!activeContextMenu) return [];
    return [
      { label: 'Reply', icon: Reply, onClick: () => {} },
      { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard.writeText(activeContextMenu!.content) },
      ...(activeContextMenu.isUser ? [{ label: 'Undo Send', icon: Undo2, iconColor: '#ff453a', textClass: 'text-[#ff453a]', onClick: () => appState.deleteMessage(activeContextMenu!.msgId) }] : []),
      { label: 'More...', icon: MoreHorizontal, onClick: () => { isSelectionMode = true; activeContextMenu = null; } }
    ];
  }

  function toggleSelection(id: string) {
    if (selectedMessages.has(id)) {
      selectedMessages.delete(id);
    } else {
      selectedMessages.add(id);
    }
  }

  function handleDeleteSelected() {
    appState.messages.filter(m => selectedMessages.has(m.id)).forEach(m => appState.deleteMessage(m.id));
    isSelectionMode = false;
    selectedMessages.clear();
  }

  function handleSend() {
    appState.send();
    const el = document.querySelector('textarea');
    if (el) el.style.height = 'auto';
  }

  function handleInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      appState.send();
      (e.currentTarget as HTMLElement).style.height = 'auto';
    }
  }

  function handleAddContact() {
    const id = prompt('Enter User ID to chat with (e.g. user2):');
    if (id) appState.addContact(id);
  }

  function closeContextMenu() {
    activeContextMenu = null;
  }

  function handleOverlayKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') activeContextMenu = null;
  }

  function handleToggleSelection(e: MouseEvent) {
    const id = (e.currentTarget as HTMLElement).dataset.id;
    if (id) toggleSelection(id);
  }

  function handleMessageClick(e: MouseEvent) {
    if (isSelectionMode) {
      const id = (e.currentTarget as HTMLElement).dataset.id;
      if (id) toggleSelection(id);
    }
  }

  function handleMessageContextMenu(e: MouseEvent) {
    if (isSelectionMode) return;
    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    activeContextMenu = {
      msgId: target.dataset.id!,
      isUser: target.dataset.isuser === 'true',
      content: target.dataset.content!,
      rect,
      winWidth: window.innerWidth,
      winHeight: window.innerHeight
    };
  }

  function handleOpenChat(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    appState.openChat(target.dataset.id!, target.dataset.name!);
  }

  function handleCloseChat() {
    appState.closeChat();
  }


</script>

<div class="h-full pt-[54px] bg-black flex flex-col transition-all duration-100 ease-out" style:padding-bottom="{keyboardPadding}px">
  {#if appState.chatView}
    <div class="flex-1 flex flex-col min-h-0 bg-black">
      <MessagesChatHeader {appState} {usersGlobalState} closeChat={handleCloseChat} handleBack={handleCloseChat} />
      
      <div class="flex-1 overflow-y-auto p-3 pb-2 flex flex-col gap-[2px] min-h-0 bg-black" bind:this={chatEl}>
        {#each appState.messages as msg, i (msg.id || i)}
          {@const isLastInGroup = i === appState.messages.length - 1 || appState.messages[i + 1].isUser !== msg.isUser}
          {@const isFirstInGroup = i === 0 || appState.messages[i - 1].isUser !== msg.isUser}
          <MessageBubble 
            {msg}
            {isLastInGroup}
            {isFirstInGroup}
            {isSelectionMode}
            isSelected={selectedMessages.has(msg.id)}
            {handleToggleSelection}
            {handleMessageClick}
            {handleMessageContextMenu}
          />
        {/each}
        {#if appState.isTyping}
          <TypingIndicator />
        {/if}
      </div>

      <!-- Input Bar / Selection Action Bar -->
      {#if isSelectionMode}
        <div class="h-[60px] bg-ios-bg3 border-t border-[#3C3C3E] px-4 flex items-center justify-between">
          <button class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer" onclick={handleDeleteSelected}>
            <Trash2 size={24} />
          </button>
          <button class="bg-ios-bg2 border-none rounded-full px-4 py-1.5 text-white font-semibold cursor-pointer">Forward</button>
        </div>
      {:else}
        <MessagesInputBar
          {appState}
          adjustTextareaHeight={adjustTextareaHeight}
          handleInputKeydown={handleInputKeydown}
          handleSend={handleSend}
        />
      {/if}
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto px-4">
      <div class="flex items-center justify-between px-1 py-2 pb-4">
        <h1 class="text-[34px] font-bold text-white">Messages</h1>
        <button class="w-[30px] h-[30px] rounded-full bg-ios-blue border-none text-white text-[20px] font-bold cursor-pointer flex items-center justify-center" onclick={handleAddContact}>+</button>
      </div>
      <MessagesSearchBar />
      <div class="bg-ios-bg2 rounded-xl overflow-hidden">
        {#if usersGlobalState.isLoading}
          {#each Array(4) as _, i (i)}
            <div class="flex gap-3 p-3 px-4 w-full border-b border-ios-sep last:border-b-0">
              <Skeleton width="45px" height="45px" borderRadius="9999px" class="shrink-0" />
              <div class="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                <div class="flex justify-between mb-1">
                  <Skeleton width="100px" height="16px" />
                  <Skeleton width="40px" height="12px" />
                </div>
                <Skeleton width="80%" height="14px" />
              </div>
            </div>
          {/each}
        {:else}
          {#each appState.sortedInbox as convo (convo.id)}
            <ConversationItem {convo} {handleOpenChat} />
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Context Menu Overlay -->
{#if activeContextMenu}
  <MessagesContextMenu
    {activeContextMenu}
    closeContextMenu={closeContextMenu}
    handleOverlayKeydown={handleOverlayKeydown}
    getMenuItems={getMenuItems}
  />
{/if}
