<script lang="ts">
  import { onMount, onDestroy, getContext } from 'svelte';
  import { RefreshCw } from '@lucide/svelte';
  import { AppCameraState } from './CameraState.svelte';

  const isPreview = getContext('isPreview');
  const state = new AppCameraState();

  onMount(() => {
    if (isPreview) return;
    state.startCamera();
  });
  onDestroy(() => state.stopCamera());
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col relative">
  {#if state.photoTaken}
    <div class="flex-1 flex items-center justify-center bg-black">
      <img src={state.photoUrl} alt="Captured" class="max-w-full max-h-full object-contain" />
    </div>
    <div class="absolute bottom-0 left-0 right-0 flex justify-between items-center px-8 pb-10 pt-3 bg-linear-to-t from-black/80 to-transparent">
      <button class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer" onclick={() => state.retake()}>Retake</button>
      <button class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer" onclick={() => state.retake()}>Use Photo</button>
    </div>
  {:else}
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <div class="flex-1 relative bg-black">
      <video bind:this={state.videoEl} autoplay playsinline muted class="absolute inset-0 w-full h-full object-cover"></video>
    </div>
    <div class="absolute bottom-0 left-0 right-0 pb-10 pt-4 bg-linear-to-t from-black/80 to-transparent">
      <div class="flex justify-center gap-5 mb-5">
        {#each state.modes as m}
          <button class="bg-transparent border-none text-[13px] font-semibold uppercase tracking-wider cursor-pointer {state.mode === m ? 'text-ios-yellow' : 'text-white/50'}" onclick={() => state.mode = m}>{m}</button>
        {/each}
      </div>
      <div class="flex items-center justify-center gap-14">
        <span class="w-10"></span>
        <button class="w-[72px] h-[72px] rounded-full border-[5px] border-white bg-white/20 cursor-pointer active:scale-90 transition-transform" onclick={() => state.capture()} aria-label="Capture"></button>
        <button class="w-10 h-10 rounded-full bg-ios-fill border-none text-white text-lg cursor-pointer flex items-center justify-center" onclick={() => state.flipCamera()} aria-label="Flip camera">
          <RefreshCw size={20} color="white" />
        </button>
      </div>
    </div>
  {/if}
</div>
