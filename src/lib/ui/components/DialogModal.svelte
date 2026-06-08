<script lang="ts">
  import { dialogState } from "$lib/states/dialogState.svelte";
</script>

{#if dialogState.isOpen && dialogState.options}
  <!-- Backdrop -->
  <div
    class="absolute inset-0 z-70 bg-black/40 flex items-center justify-center p-8 backdrop-blur-[2px] animate-[fadeIn_0.3s_ease-out]"
  >
    <!-- Dialog Box -->
    <div
      class="bg-ios-bg3/95 backdrop-blur-xl w-full max-w-67.5 rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-[scaleIn_0.2s_cubic-bezier(0.175,0.885,0.32,1.275)]"
    >
      <!-- Content Area -->
      <div class="px-4 pt-5 pb-4 flex flex-col items-center text-center">
        <h2 class="text-[17px] font-semibold text-white tracking-tight mb-1">
          {dialogState.options.title}
        </h2>
        <p class="text-[13px] text-white/70 leading-tight">
          {dialogState.options.message}
        </p>
      </div>

      <!-- Buttons -->
      {#if dialogState.options.cancelText && dialogState.options.confirmText}
        <div class="flex border-t border-white/10 h-11">
          <button
            class="flex-1 bg-transparent border-none border-r border-white/10 text-[#0A84FF] text-[17px] cursor-pointer active:bg-white/10 transition-colors"
            onclick={() => dialogState.cancel()}
          >
            {dialogState.options.cancelText}
          </button>
          <button
            class="flex-1 bg-transparent border-none text-[#0A84FF] text-[17px] font-semibold cursor-pointer active:bg-white/10 transition-colors"
            onclick={() => dialogState.confirm()}
          >
            {dialogState.options.confirmText}
          </button>
        </div>
      {:else}
        <div class="flex border-t border-white/10 h-11">
          <button
            class="flex-1 bg-transparent border-none text-[#0A84FF] text-[17px] font-semibold cursor-pointer active:bg-white/10 transition-colors"
            onclick={() => dialogState.confirm()}
          >
            {dialogState.options.confirmText || 'OK'}
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}
