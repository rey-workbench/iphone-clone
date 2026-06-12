<script lang="ts">
  import ContextMenu, { type ContextMenuItem } from "$lib/os/components/ui/ContextMenu.svelte";

  let {
    activeContextMenu,
    closeContextMenu,
    handleOverlayKeydown,
    getMenuItems
  }: {
    activeContextMenu: {
      msgId: string;
      isUser: boolean;
      content: string;
      rect: DOMRect;
      winWidth: number;
      winHeight: number;
    };
    closeContextMenu: () => void;
    handleOverlayKeydown: (e: KeyboardEvent) => void;
    getMenuItems: () => ContextMenuItem[];
  } = $props();

  const stopPropagation = (e: MouseEvent) => e.stopPropagation();
  const stopPropagationKeydown = (e: KeyboardEvent) => e.stopPropagation();
</script>

<div class="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-xl bg-black/40">
  <!-- Clickable backdrop -->
  <button
    class="absolute inset-0 w-full h-full border-none outline-none bg-transparent cursor-default"
    aria-label="Close Context Menu"
    onclick={closeContextMenu}
    onkeydown={handleOverlayKeydown}
  ></button>

  <!-- Clone of the message bubble to appear highlighted -->
  <div
    class="absolute max-w-[75%] px-3.5 py-2 rounded-[18px] text-[17px] leading-[1.3] whitespace-pre-wrap wrap-break-word pointer-events-none
            {activeContextMenu.isUser
      ? 'bg-[#0a84ff] text-white rounded-br-md msg-tail-right'
      : 'bg-[#26252A] text-white rounded-bl-md msg-tail-left'}"
    style:top="{activeContextMenu.rect.top}px"
    style:right={activeContextMenu.isUser
      ? `${activeContextMenu.winWidth - activeContextMenu.rect.right}px`
      : undefined}
    style:left={!activeContextMenu.isUser
      ? `${activeContextMenu.rect.left}px`
      : undefined}
  >
    {activeContextMenu.content}
  </div>

  <!-- Tapbacks (Reactions) -->
  <div
    class="absolute flex gap-3 bg-[#252525] rounded-full px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
    style:top="{Math.max(10, activeContextMenu.rect.top - 55)}px"
    style:right={activeContextMenu.isUser
      ? `${Math.max(10, activeContextMenu.winWidth - activeContextMenu.rect.right - 20)}px`
      : undefined}
    style:left={!activeContextMenu.isUser
      ? `${activeContextMenu.rect.left}px`
      : undefined}
  >
    <button
      class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform"
      onclick={closeContextMenu}>❤️</button
    >
    <button
      class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform"
      onclick={closeContextMenu}>👍</button
    >
    <button
      class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform"
      onclick={closeContextMenu}>👎</button
    >
    <button
      class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform"
      onclick={closeContextMenu}>😂</button
    >
    <button
      class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform"
      onclick={closeContextMenu}>‼️</button
    >
    <button
      class="text-[24px] bg-transparent border-none p-0 cursor-pointer hover:scale-125 transition-transform"
      onclick={closeContextMenu}>❓</button
    >
  </div>

  <!-- Context Menu Options -->
  <ContextMenu
    items={getMenuItems()}
    menuTop={Math.min(activeContextMenu.winHeight - 200, activeContextMenu.rect.bottom + 10)}
    menuLeft={!activeContextMenu.isUser ? activeContextMenu.rect.left : undefined}
    menuRight={activeContextMenu.isUser ? Math.max(10, activeContextMenu.winWidth - activeContextMenu.rect.right) : undefined}
    onClose={closeContextMenu}
  />
</div>
