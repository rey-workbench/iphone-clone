<script lang="ts">
  import { ChevronLeft, ChevronRight, Video } from "@lucide/svelte";

  let {
    appState,
    usersState,
    closeChat,
  }: {
    appState: any;
    usersState: any;
    closeChat: () => void;
  } = $props();
</script>

<div
  class="relative flex items-center justify-between px-3 py-2 border-b border-[#222] h-[90px] bg-black/80 backdrop-blur-xl z-20"
>
  <!-- Back Button -->
  <button
    class="flex items-center gap-1 bg-transparent border-none text-ios-blue text-[17px] cursor-pointer shrink-0"
    onclick={closeChat}
  >
    <ChevronLeft size={34} strokeWidth={2.5} class="-ml-2" />
    {#if appState.totalUnread > 0}
      <span
        class="h-[22px] min-w-[22px] px-1.5 rounded-full bg-ios-blue text-white flex items-center justify-center text-[13px] font-semibold"
        >{appState.totalUnread}</span
      >
    {/if}
  </button>

  <!-- Profile / Name -->
  <div
    class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 mt-1"
  >
    <div
      class="w-[50px] h-[50px] rounded-full bg-ios-bg2 text-white flex items-center justify-center text-[22px] font-semibold"
      style:background={usersState.users.find(
        (u: any) => u.name === appState.currentChatName,
      )?.color || "#666"}
    >
      {appState.currentChatName.charAt(0)}
    </div>
    <span
      class="text-[12px] font-medium text-white/90 flex items-center gap-0.5"
    >
      {appState.currentChatName.split(" ")[0]}
      <ChevronRight size={12} color="#666" strokeWidth={3} />
    </span>
  </div>

  <!-- Video Button -->
  <button
    class="bg-transparent border-none text-ios-blue cursor-pointer shrink-0"
  >
    <Video size={28} strokeWidth={1.5} />
  </button>
</div>
