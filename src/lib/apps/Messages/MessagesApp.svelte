<script lang="ts">
  import { ArrowUp, ChevronLeft, ChevronRight, Plus, Mic, Video, Copy, Reply, Trash2, MoreHorizontal, Forward, Undo2 } from '@lucide/svelte';
  import { messagesState as appState } from './MessagesState.svelte';
  import { usersState, dialogState } from '$lib/states';
  import Skeleton from '$lib/components/ui/Skeleton.svelte';
  import ContextMenu, { type ContextMenuItem } from '$lib/components/ui/ContextMenu.svelte';

  let chatEl: HTMLDivElement | null = $state(null);
  
  let activeContextMenu: {
    msgId: string;
    isUser: boolean;
    content: string;
    rect: DOMRect;
  } | null = $state(null);

  let isSelectionMode = $state(false);
  let selectedMessages: Set<string> = $state(new Set());

  $effect(() => {
    if (appState.messages.length > 0 && chatEl) {
      setTimeout(() => {
        if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
      }, 50);
    }
  });

  function adjustTextareaHeight(e: Event) {
    const el = e.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }
  
  let menuItems: ContextMenuItem[] = $derived.by(() => {
    if (!activeContextMenu) return [];
    return [
      { label: 'Reply', icon: Reply, onClick: () => {} },
      { label: 'Copy', icon: Copy, onClick: () => navigator.clipboard.writeText(activeContextMenu!.content) },
      ...(activeContextMenu.isUser ? [{ label: 'Undo Send', icon: Undo2, iconColor: '#ff453a', textClass: 'text-[#ff453a]', onClick: () => appState.deleteMessage(activeContextMenu!.msgId) }] : []),
      { label: 'More...', icon: MoreHorizontal, onClick: () => { isSelectionMode = true; activeContextMenu = null; } }
    ];
  });

  function toggleSelection(id: string) {
    if (selectedMessages.has(id)) {
      selectedMessages.delete(id);
    } else {
      selectedMessages.add(id);
    }
    // trigger reactivity
    selectedMessages = new Set(selectedMessages);
  }

  function deleteSelected() {
    if (selectedMessages.size === 0) return;
    selectedMessages.forEach(id => appState.deleteMessage(id));
    selectedMessages = new Set();
    isSelectionMode = false;
  }

  const tailRightClasses = "relative before:content-[''] before:absolute before:bottom-0 before:-right-2 before:h-5 before:w-5 before:bg-[#0a84ff] before:rounded-bl-[16px] before:-z-10 after:content-[''] after:absolute after:bottom-0 after:-right-[10px] after:w-[10px] after:h-5 after:bg-black after:rounded-bl-[10px] after:z-10";
  
  const tailLeftClasses = "relative before:content-[''] before:absolute before:bottom-0 before:-left-2 before:h-5 before:w-5 before:bg-[#26252A] before:rounded-br-[16px] before:-z-10 after:content-[''] after:absolute after:bottom-0 after:-left-[10px] after:w-[10px] after:h-5 after:bg-black after:rounded-br-[10px] after:z-10";
</script>

<div class="h-full pt-[54px] pb-0 bg-black flex flex-col ">
  {#if appState.chatView}
    <div class="flex-1 flex flex-col min-h-0 bg-black">
      <div class="relative flex items-center justify-between px-4 py-2 border-b border-[#222] h-[60px] bg-black/80 backdrop-blur-xl z-20">
        <!-- Back Button -->
        <button class="flex items-center gap-1 bg-transparent border-none text-ios-blue text-[17px] cursor-pointer shrink-0" onclick={() => appState.closeChat()}>
          <ChevronLeft size={28} strokeWidth={2.5} class="-ml-2" />
          {#if appState.totalUnread > 0}
            <span class="w-5 h-5 rounded-full bg-ios-blue text-white flex items-center justify-center text-[12px] font-bold">{appState.totalUnread}</span>
          {/if}
        </button>

        <!-- Profile / Name -->
        <div class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div class="w-[32px] h-[32px] rounded-full bg-ios-bg2 text-white flex items-center justify-center text-[14px] font-semibold mb-0.5" style="background: {usersState.users.find(u => u.name === appState.currentChatName)?.color || '#333'}">
            {appState.currentChatName.charAt(0)}
          </div>
          <span class="text-[10px] font-medium text-white flex items-center gap-0.5">
            {appState.currentChatName.split(' ')[0]} <ChevronRight size={10} color="#8e8e93" strokeWidth={3} />
          </span>
        </div>

        <!-- Video Button -->
        <button class="bg-transparent border-none text-ios-blue cursor-pointer shrink-0">
          <Video size={26} strokeWidth={1.5} />
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-3 pb-2 flex flex-col gap-[2px] min-h-0 bg-black" bind:this={chatEl}>
        {#each appState.messages as msg, i}
          {@const isLastInGroup = i === appState.messages.length - 1 || appState.messages[i + 1].isUser !== msg.isUser}
          {@const isFirstInGroup = i === 0 || appState.messages[i - 1].isUser !== msg.isUser}
          <div class="flex items-end {msg.isUser ? 'justify-end pr-2' : 'pl-2'} {isLastInGroup ? 'mb-2' : ''} {isFirstInGroup ? 'mt-1' : ''} {isSelectionMode ? 'pl-10' : ''} relative">
            {#if isSelectionMode}
              <button 
                class="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-ios-sep bg-transparent flex items-center justify-center p-0 cursor-pointer {selectedMessages.has(msg.id) ? 'bg-ios-blue border-none' : ''}"
                onclick={() => toggleSelection(msg.id)}
              >
                {#if selectedMessages.has(msg.id)}
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
              onclick={() => {
                if (isSelectionMode) toggleSelection(msg.id);
              }}
              oncontextmenu={(e) => {
                if (isSelectionMode) return;
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                activeContextMenu = {
                  msgId: msg.id,
                  isUser: msg.isUser,
                  content: msg.content,
                  rect
                };
              }}
            >
              {msg.content}
            </div>
          </div>
        {/each}
        {#if appState.isTyping}
          <div class="flex pl-2 mb-2">
            <div class="bg-[#26252A] text-white rounded-[18px] rounded-bl-md px-4 py-3 flex gap-1 items-center {tailLeftClasses}">
              <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite_0.2s]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite_0.4s]"></span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Input Bar / Selection Action Bar -->
      {#if isSelectionMode}
        <div class="h-[60px] bg-ios-bg3 border-t border-[#3C3C3E] px-4 flex items-center justify-between">
          <button class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer" onclick={() => { appState.messages.filter(m => selectedMessages.has(m.id)).forEach(m => appState.deleteMessage(m.id)); isSelectionMode = false; selectedMessages.clear(); }}>
            <Trash2 size={24} />
          </button>
          <button class="bg-ios-bg2 border-none rounded-full px-4 py-1.5 text-white font-semibold cursor-pointer">Forward</button>
        </div>
      {:else}
        <div class="flex items-end gap-3 px-3 pt-2 pb-8 border-t border-[#222] bg-black/90 backdrop-blur-md z-20 relative">
          <button class="w-[32px] h-[32px] rounded-full bg-ios-bg3 flex items-center justify-center shrink-0 border-none cursor-pointer mb-1">
            <Plus size={20} color="#8e8e93" strokeWidth={2.5} />
          </button>

          <div class="flex-1 flex items-end bg-ios-bg2 rounded-3xl min-h-[34px] border border-[#333] p-0.5 pl-3 pr-0.5 mb-0.5">
            <textarea
              bind:value={appState.inputText}
              placeholder="iMessage"
              rows="1"
              oninput={adjustTextareaHeight}
              onkeydown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  appState.send();
                  e.currentTarget.style.height = 'auto';
                }
              }}
              class="flex-1 bg-transparent text-white text-[16px] outline-none placeholder:text-[#8e8e93] resize-none overflow-hidden py-1.5 self-center mb-[-2px]"
              style="min-height: 22px; max-height: 100px; padding-top: 6px; padding-bottom: 6px;"
            ></textarea>
            
            <div class="shrink-0 flex items-center justify-center h-[30px] w-[30px] ml-1 self-end mb-0.5">
              {#if appState.inputText}
                <button class="w-full h-full rounded-full bg-ios-blue border-none text-white cursor-pointer flex items-center justify-center" onclick={() => { appState.send(); const el = document.querySelector('textarea'); if(el) el.style.height = 'auto'; }}>
                  <ArrowUp size={18} strokeWidth={3} />
                </button>
              {:else}
                <Mic size={20} color="#8e8e93" strokeWidth={2} />
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto px-4">
      <div class="flex items-center justify-between px-1 py-2 pb-4">
        <h1 class="text-[34px] font-bold text-white">Messages</h1>
        <button class="w-[30px] h-[30px] rounded-full bg-ios-blue border-none text-white text-[20px] font-bold cursor-pointer flex items-center justify-center" onclick={() => {
          const id = prompt('Enter User ID to chat with (e.g. user2):');
          if (id) appState.addContact(id);
        }}>+</button>
      </div>
      <div class="bg-ios-bg2 rounded-xl overflow-hidden">
        {#if usersState.loading}
          {#each Array(4) as _}
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
            <button class="flex gap-3 p-3 px-4 w-full border-none bg-transparent cursor-pointer text-white text-left border-b border-ios-sep last:border-b-0" onclick={() => appState.openChat(convo.id, convo.name)}>
              <div class="w-[45px] h-[45px] rounded-full flex items-center justify-center text-[16px] font-semibold text-white shrink-0" style="background:{convo.color}">
                {#if convo.icon}
                  <convo.icon size={24} color="white" />
                {:else}
                  {convo.initials}
                {/if}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between mb-1">
                  <span class="text-[17px] {convo.unread ? 'font-semibold' : ''}">{convo.name}</span>
                  <span class="text-[15px] {convo.unread ? 'text-ios-blue font-medium' : 'text-ios-label2'}">{convo.time}</span>
                </div>
                <div class="flex justify-between items-center gap-2">
                  <span class="text-[15px] {convo.unread ? 'text-white font-medium' : 'text-ios-label2'} truncate block flex-1">{convo.lastMsg}</span>
                  {#if convo.unread > 0}
                    <span class="px-1.5 h-5 min-w-[20px] rounded-full bg-ios-blue text-white text-[12px] font-medium flex items-center justify-center shrink-0">{convo.unread}</span>
                  {/if}
                </div>
              </div>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Context Menu Overlay -->
{#if activeContextMenu}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-xl bg-black/40"
    onclick={() => activeContextMenu = null}
  >  <!-- Clone of the message bubble to appear highlighted -->
    <div 
      class="absolute max-w-[75%] px-3.5 py-2 rounded-[18px] text-[17px] leading-[1.3] whitespace-pre-wrap wrap-break-word 
             {activeContextMenu.isUser ? 'bg-[#0a84ff] text-white rounded-br-md msg-tail-right' : 'bg-[#26252A] text-white rounded-bl-md msg-tail-left'}"
      style="top: {activeContextMenu.rect.top}px; {activeContextMenu.isUser ? `right: ${window.innerWidth - activeContextMenu.rect.right}px;` : `left: ${activeContextMenu.rect.left}px;`}"
    >
      {activeContextMenu.content}
    </div>

    <!-- Tapbacks (Reactions) -->
    <div 
      class="absolute flex gap-3 bg-[#252525] rounded-full px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      style="top: {Math.max(10, activeContextMenu.rect.top - 55)}px; {activeContextMenu.isUser ? `right: ${Math.max(10, window.innerWidth - activeContextMenu.rect.right - 20)}px;` : `left: ${activeContextMenu.rect.left}px;`}"
      onclick={(e) => e.stopPropagation()}
    >
      <button class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform" onclick={() => activeContextMenu = null}>❤️</button>
      <button class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform" onclick={() => activeContextMenu = null}>👍</button>
      <button class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform" onclick={() => activeContextMenu = null}>👎</button>
      <button class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform" onclick={() => activeContextMenu = null}>😂</button>
      <button class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform" onclick={() => activeContextMenu = null}>‼️</button>
      <button class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform" onclick={() => activeContextMenu = null}>❓</button>
    </div>

    <!-- Context Menu Options -->
    <ContextMenu 
      items={menuItems}
      style="top: {Math.min(window.innerHeight - 200, activeContextMenu.rect.bottom + 10)}px; {activeContextMenu.isUser ? `right: ${Math.max(10, window.innerWidth - activeContextMenu.rect.right)}px;` : `left: ${activeContextMenu.rect.left}px;`}"
      onClose={() => activeContextMenu = null}
    />
  </div>
{/if}
