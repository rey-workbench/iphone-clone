<script lang="ts">
  import { AppSafariState } from './SafariState.svelte';

  const state = new AppSafariState();
</script>

<div class="h-full pt-[54px] pb-5 bg-ios-bg flex flex-col">
  <div class="flex-1 relative">
    <iframe src={state.url} title="Browser" class="absolute inset-0 w-full h-full border-none bg-white"></iframe>
  </div>
  <div class="flex items-center gap-2 px-3 py-2  bg-[rgba(30,30,30,0.95)] border-t border-ios-sep">
    {#if state.showInput}
      <input bind:value={state.inputUrl} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && state.navigate()}
        class="flex-1 h-9 rounded-[10px] bg-ios-fill border-none text-white px-3 text-[15px] outline-none" />
      <button class="bg-transparent border-none text-ios-blue text-[15px] font-medium cursor-pointer" onclick={() => state.navigate()}>Go</button>
    {:else}
      <button class="flex-1 h-9 rounded-[10px] bg-ios-fill flex items-center justify-center text-ios-label2 text-[15px] cursor-pointer border-none" onclick={() => state.toggleInput()}>
        {state.url.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 40)}
      </button>
    {/if}
  </div>
</div>
