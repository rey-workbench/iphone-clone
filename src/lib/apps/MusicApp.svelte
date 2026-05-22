<script lang="ts">
  import { onMount } from 'svelte';
  import { Play, Pause, SkipBack, SkipForward, ChevronLeft } from 'lucide-svelte';

  interface Track { name: string; artist: string; art: string; preview: string }

  let tracks: Track[] = $state([]);
  let playing = $state(false);
  let current: Track | null = $state(null);
  let audio: HTMLAudioElement | null = $state(null);
  let showPlayer = $state(false);
  let progress = $state(0);

  onMount(async () => {
    try {
      const r = await fetch('https://itunes.apple.com/search?term=pop&media=music&limit=20');
      const d = await r.json();
      tracks = d.results.map((t: any) => ({ name: t.trackName, artist: t.artistName, art: t.artworkUrl100.replace('100x100', '400x400'), preview: t.previewUrl }));
    } catch { tracks = []; }
  });

  function play(t: Track) {
    if (audio) { audio.pause(); audio.removeEventListener('timeupdate', updateProgress); }
    current = t; audio = new Audio(t.preview); audio.play(); playing = true; showPlayer = true;
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => { playing = false; progress = 0; });
  }

  function updateProgress() { if (audio && audio.duration) progress = (audio.currentTime / audio.duration) * 100; }

  function togglePlay() {
    if (!audio) return;
    if (playing) audio.pause(); else audio.play();
    playing = !playing;
  }

  function playNext(dir: number) {
    if (!current) return;
    const idx = tracks.indexOf(current);
    const next = tracks[(idx + dir + tracks.length) % tracks.length];
    if (next) play(next);
  }
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col ">
  {#if showPlayer && current}
    <div class="flex-1 flex flex-col items-center px-8 pt-5">
      <button class="text-ios-label2 text-[13px] bg-transparent border-none cursor-pointer self-start mb-3 flex items-center" onclick={() => showPlayer = false}>
        <ChevronLeft size={16} class="mr-1" /> Library
      </button>
      <img src={current.art} alt={current.name} class="w-[280px] h-[280px] rounded-2xl shadow-2xl object-cover" />
      <div class="w-full mt-7">
        <div class="font-semibold text-white text-[22px] truncate">{current.name}</div>
        <div class="text-ios-label2 text-[17px] truncate">{current.artist}</div>
      </div>
      <div class="w-full mt-5">
        <div class="w-full h-1 bg-white/15 rounded-sm"><div class="h-full pt-[54px] pb-5 bg-white/70 rounded-sm transition-[width] duration-200" style="width:{progress}%"></div></div>
      </div>
      <div class="flex items-center gap-14 mt-8">
        <button class="bg-transparent border-none cursor-pointer text-white" onclick={() => playNext(-1)} aria-label="Previous"><SkipBack size={32} fill="white" /></button>
        <button class="w-16 h-16 rounded-full bg-white border-none cursor-pointer flex items-center justify-center text-black" onclick={togglePlay} aria-label="Play/Pause">
          {#if playing}<Pause size={30} fill="black" />{:else}<Play size={30} fill="black" class="ml-1" />{/if}
        </button>
        <button class="bg-transparent border-none cursor-pointer text-white" onclick={() => playNext(1)} aria-label="Next"><SkipForward size={32} fill="white" /></button>
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto px-4">
      <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4">Listen Now</h1>
      {#if tracks.length === 0}
        <div class="flex justify-center py-20"><div class="w-8 h-8 border-2 border-ios-label2 border-t-white rounded-full animate-spin"></div></div>
      {:else}
        <div class="mb-5">
          <h2 class="text-[22px] font-bold text-white mb-3">Top Tracks</h2>
          <div class="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
            {#each tracks.slice(0, 8) as t}
              <button class="min-w-[150px] bg-transparent border-none cursor-pointer text-left p-0" onclick={() => play(t)}>
                <img src={t.art} alt={t.name} class="w-[150px] h-[150px] rounded-xl object-cover" />
                <div class="text-[13px] font-medium text-white mt-1.5 truncate w-[150px]">{t.name}</div>
                <div class="text-[11px] text-ios-label2 truncate w-[150px]">{t.artist}</div>
              </button>
            {/each}
          </div>
        </div>
        <div class="bg-ios-bg2 rounded-xl overflow-hidden mb-5">
          {#each tracks as t, i}
            <button class="flex gap-3 p-2 px-3 w-full border-none bg-transparent cursor-pointer text-left text-white items-center" onclick={() => play(t)}>
              <img src={t.art} alt={t.name} class="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div class="flex-1 min-w-0"><div class="text-[16px] truncate">{t.name}</div><div class="text-[13px] text-ios-label2 truncate">{t.artist}</div></div>
              <Play size={18} class="text-ios-pink" fill="currentColor" />
            </button>
            {#if i < tracks.length - 1}<div class="h-px bg-ios-sep ml-[68px]"></div>{/if}
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  {#if current && !showPlayer}
    <div class="flex gap-3 items-center px-3 py-2  bg-ios-bg2 border-t border-ios-sep cursor-pointer text-white text-left w-full" role="button" tabindex="0" onclick={() => showPlayer = true} onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') showPlayer = true; }}>
      <img src={current.art} alt={current.name} class="w-11 h-11 rounded-lg object-cover" />
      <div class="flex-1 min-w-0"><div class="text-[15px] truncate">{current.name}</div><div class="text-[12px] text-ios-label2 truncate">{current.artist}</div></div>
      <button class="bg-transparent border-none cursor-pointer text-white" onclick={(e: MouseEvent) => { e.stopPropagation(); togglePlay(); }} aria-label="Play/Pause">
        {#if playing}<Pause size={22} />{:else}<Play size={22} />{/if}
      </button>
    </div>
  {/if}
</div>
