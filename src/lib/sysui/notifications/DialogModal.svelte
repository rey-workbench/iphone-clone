<script lang="ts">
  import { dialogGlobalState } from "$lib/core/states/dialogGlobalState.svelte";

  const handleCancel = () => dialogGlobalState.cancel();
  const handleConfirm = () => dialogGlobalState.confirm();
</script>

{#if dialogGlobalState.isOpen && dialogGlobalState.options}
  <!-- Backdrop -->
  <div
    class="absolute inset-0 z-9999 bg-black/40 flex items-center justify-center p-8 backdrop-blur-[2px] animate-[fadeIn_0.3s_ease-out]"
  >
    <!-- Dialog Box -->
    <div
      class="bg-ios-bg3/95 backdrop-blur-xl w-full max-w-67.5 rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-[scaleIn_0.2s_cubic-bezier(0.175,0.885,0.32,1.275)]"
    >
      <!-- Content Area -->
      <div class="px-4 pt-5 pb-4 flex flex-col items-center text-center">
        <h2 class="text-[17px] font-semibold text-white tracking-tight mb-1">
          {dialogGlobalState.options.title}
        </h2>
        <p class="text-[13px] text-white/70 leading-tight">
          {dialogGlobalState.options.message}
        </p>
      </div>

      <!-- Buttons -->
      {#if dialogGlobalState.options.cancelText && dialogGlobalState.options.confirmText}
        <div class="flex border-t border-white/10 h-11">
          <button
            class="flex-1 bg-transparent border-none border-r border-white/10 text-[#0A84FF] text-[17px] cursor-pointer active:bg-white/10 transition-colors"
            onclick={handleCancel}
          >
            {dialogGlobalState.options.cancelText}
          </button>
          <button
            class="flex-1 bg-transparent border-none text-[#0A84FF] text-[17px] font-semibold cursor-pointer active:bg-white/10 transition-colors"
            onclick={handleConfirm}
          >
            {dialogGlobalState.options.confirmText}
          </button>
        </div>
      {:else}
        <div class="flex border-t border-white/10 h-11">
          <button
            class="flex-1 bg-transparent border-none text-[#0A84FF] text-[17px] font-semibold cursor-pointer active:bg-white/10 transition-colors"
            onclick={handleConfirm}
          >
            {dialogGlobalState.options.confirmText || 'OK'}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
