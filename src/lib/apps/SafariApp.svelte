<script lang="ts">
  let url = $state('https://www.google.com');
  let inputUrl = $state('https://www.google.com');
  let showInput = $state(false);

  function navigate() { if (inputUrl.trim()) { url = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`; showInput = false; } }
</script>

<div class="h-full pt-[54px] pb-5 bg-ios-bg flex flex-col">
  <div class="flex-1 relative">
    <iframe src={url} title="Browser" class="absolute inset-0 w-full h-full border-none bg-white"></iframe>
  </div>
  <div class="flex items-center gap-2 px-3 py-2  bg-[rgba(30,30,30,0.95)] border-t border-ios-sep">
    {#if showInput}
      <input bind:value={inputUrl} onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && navigate()}
        class="flex-1 h-9 rounded-[10px] bg-ios-fill border-none text-white px-3 text-[15px] outline-none" />
      <button class="bg-transparent border-none text-ios-blue text-[15px] font-medium cursor-pointer" onclick={navigate}>Go</button>
    {:else}
      <button class="flex-1 h-9 rounded-[10px] bg-ios-fill flex items-center justify-center text-ios-label2 text-[15px] cursor-pointer border-none" onclick={() => showInput = true}>
        {url.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 40)}
      </button>
    {/if}
  </div>
</div>
