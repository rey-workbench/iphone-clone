<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { RefreshCw } from 'lucide-svelte';

  let videoEl: HTMLVideoElement | undefined = $state(undefined);
  let photoTaken = $state(false);
  let photoUrl = $state('');
  let stream: MediaStream | null = $state(null);
  let mode: 'video' | 'photo' | 'portrait' = $state('photo');
  let facingMode = $state<'user' | 'environment'>('environment');

  async function startCamera() {
    try {
      if (stream) stream.getTracks().forEach(t => t.stop());
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } });
      if (videoEl) { videoEl.srcObject = stream; }
    } catch { /* camera not available */ }
  }

  function capture() {
    if (!videoEl) return;
    const c = document.createElement('canvas'); c.width = videoEl.videoWidth; c.height = videoEl.videoHeight;
    c.getContext('2d')?.drawImage(videoEl, 0, 0);
    photoUrl = c.toDataURL('image/png'); photoTaken = true;
  }

  function flipCamera() { facingMode = facingMode === 'user' ? 'environment' : 'user'; startCamera(); }
  function retake() { photoTaken = false; photoUrl = ''; }

  onMount(startCamera);
  onDestroy(() => { if (stream) stream.getTracks().forEach(t => t.stop()); });

  const modes: ('video' | 'photo' | 'portrait')[] = ['video', 'photo', 'portrait'];
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col relative">
  {#if photoTaken}
    <div class="flex-1 flex items-center justify-center bg-black">
      <img src={photoUrl} alt="Captured" class="max-w-full max-h-full object-contain" />
    </div>
    <div class="absolute bottom-0 left-0 right-0 flex justify-between items-center px-8 pb-10 pt-3 bg-linear-to-t from-black/80 to-transparent">
      <button class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer" onclick={retake}>Retake</button>
      <button class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer" onclick={retake}>Use Photo</button>
    </div>
  {:else}
    <!-- svelte-ignore element_invalid_self_closing_tag -->
    <div class="flex-1 relative bg-black">
      <video bind:this={videoEl} autoplay playsinline muted class="absolute inset-0 w-full h-full object-cover"></video>
    </div>
    <div class="absolute bottom-0 left-0 right-0 pb-10 pt-4 bg-linear-to-t from-black/80 to-transparent">
      <div class="flex justify-center gap-5 mb-5">
        {#each modes as m}
          <button class="bg-transparent border-none text-[13px] font-semibold uppercase tracking-wider cursor-pointer {mode === m ? 'text-ios-yellow' : 'text-white/50'}" onclick={() => mode = m}>{m}</button>
        {/each}
      </div>
      <div class="flex items-center justify-center gap-14">
        <span class="w-10"></span>
        <button class="w-[72px] h-[72px] rounded-full border-[5px] border-white bg-white/20 cursor-pointer active:scale-90 transition-transform" onclick={capture} aria-label="Capture"></button>
        <button class="w-10 h-10 rounded-full bg-ios-fill border-none text-white text-lg cursor-pointer flex items-center justify-center" onclick={flipCamera} aria-label="Flip camera">
          <RefreshCw size={20} color="white" />
        </button>
      </div>
    </div>
  {/if}
</div>
