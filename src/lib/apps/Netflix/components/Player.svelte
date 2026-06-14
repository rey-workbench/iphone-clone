<script lang="ts">
  import { netflixState } from "../NetflixAppState.svelte";
  ;

  const media = $derived(netflixState.selectedMedia);
  const isTvShow = $derived(
    media?.media_type === "tv" || media?.title === undefined,
  );

  let iframeUrl = $state("");

  $effect(() => {
    if (media) {
      if (isTvShow) {
        iframeUrl = `https://vidsrc.cc/v2/embed/tv/${media.id}/1/1`;
      } else {
        iframeUrl = `https://vidsrc.cc/v2/embed/movie/${media.id}`;
      }
    }
  });

  const handleGoBack = () => netflixState.goBack();
</script>

<div class="absolute inset-0 bg-black z-50 flex items-center justify-center animate-[fadeIn_0.3s_ease] overflow-hidden">
  <!-- Landscape Container -->
  <div class="w-[852px] h-[393px] rotate-90 origin-center relative bg-black flex items-center justify-center">
    <!-- Back Button (Floating, now oriented for landscape) -->
    <button
      aria-label="Back"
      class="absolute top-8 left-12 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border-none hover:bg-black/70 transition-colors"
      onclick={handleGoBack}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
    </button>

    <video 
      src="https://www.w3schools.com/html/mov_bbb.mp4" 
      class="w-full h-full object-contain"
      controls 
      autoplay
      muted
      playsinline
    >
      <track kind="captions" />
    </video>
  </div>
</div>
