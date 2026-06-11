<script lang="ts">
  import { ArrowUp, ChevronLeft } from '@lucide/svelte';
  import { MessagesState } from './MessagesState.svelte';
  import { usersState } from '$lib/states';
  import Skeleton from '$lib/components/ui/Skeleton.svelte';

  const state = new MessagesState();
</script>

<div class="h-full pt-[54px] pb-0 bg-black flex flex-col ">
  {#if state.chatView}
    <div class="flex-1 flex flex-col min-h-0">
      <div class="relative flex items-center justify-between px-4 py-2 border-b border-ios-sep h-12">
        <button class="absolute left-4 bg-transparent border-none text-ios-blue text-[17px] cursor-pointer flex items-center shrink-0 z-10" onclick={() => state.closeChat()}>
          <ChevronLeft size={20} class="mr-1" /> Messages
        </button>
        <div class="w-full text-center px-[100px]">
          <span class="text-[17px] font-semibold text-white truncate block">{state.currentChatName}</span>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-3 pb-2 flex flex-col gap-1 min-h-0">
        {#each state.messages as msg, i}
          {@const isLastInGroup = i === state.messages.length - 1 || state.messages[i + 1].isUser !== msg.isUser}
          <div class="flex {msg.isUser ? 'justify-end' : ''}">
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
              class="max-w-[75%] px-4 py-2.5 rounded-2xl text-[17px] leading-snug whitespace-pre-wrap wrap-break-word {msg.isUser ? `bg-linear-to-b from-ios-blue to-[#0051D5] text-white ${isLastInGroup ? 'rounded-br-[4px]' : 'rounded-br-xl'}` : `bg-ios-bg3 text-white ${isLastInGroup ? 'rounded-bl-[4px]' : 'rounded-bl-xl'}`}"
              oncontextmenu={(e) => {
                if (msg.isUser) {
                  e.preventDefault();
                  if (confirm('Delete this message?')) {
                    state.deleteMessage(msg.id);
                  }
                }
              }}
            >
              {msg.content}
            </div>
          </div>
        {/each}
        {#if state.isTyping}
          <div class="flex"><div class="bg-ios-bg3 text-white rounded-2xl rounded-bl-[4px] px-4 py-3 flex gap-1 items-center">
            <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite_0.2s]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite_0.4s]"></span>
          </div></div>
        {/if}
      </div>
      <div class="flex items-center gap-2 px-3 pt-2 pb-8 border-t border-ios-sep bg-[rgba(30,30,30,0.95)]">
        <input bind:value={state.inputText} placeholder="iMessage" onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && state.send()}
          class="flex-1 h-9 rounded-[18px] border border-ios-sep bg-transparent text-white px-4 text-[17px] outline-none" />
        {#if state.inputText}
          <button class="w-[30px] h-[30px] rounded-full bg-ios-blue border-none text-white text-[16px] font-bold cursor-pointer flex items-center justify-center" onclick={() => state.send()}>
            <ArrowUp size={18} color="white" />
          </button>
        {/if}
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto px-4">
      <div class="flex items-center justify-between px-1 py-2 pb-4">
        <h1 class="text-[34px] font-bold text-white">Messages</h1>
        <button class="w-[30px] h-[30px] rounded-full bg-ios-blue border-none text-white text-[20px] font-bold cursor-pointer flex items-center justify-center" onclick={() => {
          const id = prompt('Enter User ID to chat with (e.g. user2):');
          if (id) state.addContact(id);
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
          {#each state.sortedInbox as convo (convo.id)}
            <button class="flex gap-3 p-3 px-4 w-full border-none bg-transparent cursor-pointer text-white text-left border-b border-ios-sep last:border-b-0" onclick={() => state.openChat(convo.id, convo.name)}>
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
