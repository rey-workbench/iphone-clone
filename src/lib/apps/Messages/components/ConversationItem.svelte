<script lang="ts">
  import type { IConversation } from '$lib/types';
  const { convo, handleOpenChat }: { convo: IConversation, handleOpenChat: (e: MouseEvent) => void } = $props();
</script>

<button class="flex gap-3 p-3 px-4 w-full border-none bg-transparent cursor-pointer text-white text-left border-b border-ios-sep last:border-b-0" data-id={convo.id} data-name={convo.name} onclick={handleOpenChat}>
  <div class="w-[45px] h-[45px] rounded-full flex items-center justify-center text-[16px] font-semibold text-white shrink-0" style:background={convo.color}>
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
