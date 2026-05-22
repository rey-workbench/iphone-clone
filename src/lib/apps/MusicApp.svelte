<script lang="ts">
  import { onMount } from "svelte";
  import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume1,
    Volume2,
    MoreHorizontal,
    MessageSquareQuote,
    Airplay,
    ListMusic,
    PlayCircle,
    LayoutGrid,
    Radio,
    Search
  } from '@lucide/svelte';

  interface Track {
    name: string;
    artist: string;
    art: string;
    preview: string;
    id?: string;
  }

  let tracks: Track[] = $state([]);
  let playing = $state(false);
  let current: Track | null = $state(null);
  let showPlayer = $state(false);
  let progress = $state(0);
  let volume = $state(60);
  let currentTab = $state('listen_now');
  let searchQuery = $state('');
  let searchResults: Track[] = $state([]);
  let isSearching = $state(false);

  let player: any = null;
  let progressInterval: any;

  onMount(() => {
    // Load YouTube API
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    function initPlayer() {
      player = new (window as any).YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: "",
        playerVars: {
          playsinline: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
        },
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
    }

    (async () => {
      try {
        const r = await fetch("/api/ytsearch?q=popular");
        const d = await r.json();
        if (d.results) {
          tracks = d.results.slice(0, 20).map((t: any) => ({
            name: t.title,
            artist: t.authorName || "YouTube",
            art: t.thumbnail,
            preview: t.url,
            id: t.videoId,
          }));
        }
      } catch {
        tracks = [];
      }
    })();

    return () => {
      clearInterval(progressInterval);
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    };
  });

  function onPlayerStateChange(event: any) {
    if (event.data === (window as any).YT.PlayerState.PLAYING) {
      playing = true;
      clearInterval(progressInterval);
      progressInterval = setInterval(updateProgress, 500);
    } else {
      playing = false;
      clearInterval(progressInterval);
      if (event.data === (window as any).YT.PlayerState.ENDED) {
        progress = 0;
        playNext(1);
      }
    }
  }

  function play(t: Track) {
    current = t;
    showPlayer = true;
    if (player && typeof player.loadVideoById === "function") {
      player.loadVideoById(t.id);
      player.playVideo();
    } else {
      setTimeout(() => {
        if (player && typeof player.loadVideoById === "function") {
          player.loadVideoById(t.id);
          player.playVideo();
        }
      }, 1000);
    }
  }

  function updateProgress() {
    if (player && player.getDuration) {
      const d = player.getDuration();
      const c = player.getCurrentTime();
      if (d > 0) progress = (c / d) * 100;
    }
  }

  function togglePlay() {
    if (!player) return;
    if (playing) player.pauseVideo();
    else player.playVideo();
  }

  function playNext(dir: number) {
    if (!current) return;
    const idx = tracks.indexOf(current);
    const next = tracks[(idx + dir + tracks.length) % tracks.length];
    if (next) play(next);
  }

  function formatTime(seconds: number, isRemaining = false) {
    if (!seconds || isNaN(seconds)) return isRemaining ? "-00:00" : "00:00";
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = Math.floor(absSeconds % 60);
    const formatted = `${m}:${s < 10 ? '0' : ''}${s}`;
    return isRemaining ? `-${formatted}` : formatted;
  }

  function handleSeek(e: MouseEvent) {
    if (!player || typeof player.getDuration !== 'function') return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * player.getDuration();
    player.seekTo(newTime, true);
    progress = pos * 100;
  }

  function handleVolume(e: MouseEvent) {
    if (!player || typeof player.setVolume !== 'function') return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    volume = pos * 100;
    player.setVolume(volume);
  }

  async function doSearch() {
    if (!searchQuery.trim()) return;
    isSearching = true;
    try {
      const r = await fetch(`/api/ytsearch?q=${encodeURIComponent(searchQuery)}`);
      const d = await r.json();
      if (d.results) {
        searchResults = d.results.slice(0, 20).map((t: any) => ({
          name: t.title,
          artist: t.authorName || "YouTube",
          art: t.thumbnail,
          preview: t.url,
          id: t.videoId,
        }));
      }
    } catch {
      searchResults = [];
    }
    isSearching = false;
  }
</script>

<div class="h-full bg-black flex flex-col relative overflow-hidden">
  {#if showPlayer && current}
    <!-- Background Blur -->
    <div class="absolute inset-0 z-10 bg-black">
      <img src={current.art} alt="bg" class="absolute inset-0 w-full h-full object-cover blur-[80px] opacity-70 scale-125" />
      <!-- Overlay to ensure text readability -->
      <div class="absolute inset-0 bg-black/30"></div>
    </div>

    <!-- Player Content -->
    <div class="absolute inset-0 z-20 flex flex-col px-6 pt-12 pb-8">
      <!-- Drag Handle -->
      <div class="w-full flex justify-center mb-8" onclick={() => (showPlayer = false)} role="button" tabindex="0" onkeydown={() => {}}>
        <div class="w-10 h-1 bg-white/40 rounded-full"></div>
      </div>

      <img
        src={current.art}
        alt={current.name}
        class="w-full aspect-square rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] object-cover mb-12"
      />

      <div class="w-full flex-1 flex flex-col">
        <div class="w-full flex justify-between items-center mb-8">
          <div class="flex-1 min-w-0 pr-4">
            <div class="font-bold text-white text-[22px] truncate">
              {current.name}
            </div>
            <div class="text-white/70 text-[18px] truncate mt-0.5">{current.artist}</div>
          </div>
          <button class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 border-none cursor-pointer">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div class="w-full mb-10">
          <div class="w-full h-1.5 bg-white/20 rounded-full relative cursor-pointer" onclick={handleSeek} role="slider" tabindex="0">
            <div
              class="absolute top-0 left-0 h-full bg-white rounded-full transition-[width] duration-200"
              style="width:{progress}%"
            ></div>
            <!-- Thumb -->
            <div class="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md scale-[1.5] pointer-events-none" style="left: calc({progress}% - 4px)"></div>
          </div>
          <div class="flex justify-between mt-2.5 text-[11px] text-white/60 font-medium pointer-events-none">
            <span>{formatTime((progress / 100) * (player?.getDuration() || 0))}</span>
            <span>{formatTime((player?.getDuration() || 0) - ((progress / 100) * (player?.getDuration() || 0)), true)}</span>
          </div>
        </div>

        <div class="flex items-center justify-between px-6 mb-12">
          <button
            class="bg-transparent border-none cursor-pointer text-white hover:scale-110 transition-transform active:scale-95"
            onclick={() => playNext(-1)}
            aria-label="Previous"><SkipBack size={44} fill="white" strokeWidth={0} /></button
          >
          <button
            class="bg-transparent border-none cursor-pointer flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95"
            onclick={togglePlay}
            aria-label="Play/Pause"
          >
            {#if playing}
              <Pause size={56} fill="white" strokeWidth={0} />
            {:else}
              <Play size={56} fill="white" strokeWidth={0} />
            {/if}
          </button>
          <button
            class="bg-transparent border-none cursor-pointer text-white hover:scale-110 transition-transform active:scale-95"
            onclick={() => playNext(1)}
            aria-label="Next"><SkipForward size={44} fill="white" strokeWidth={0} /></button
          >
        </div>

        <!-- Volume Slider -->
        <div class="flex items-center gap-3 text-white/50 mb-10">
          <Volume1 size={14} />
          <div class="flex-1 h-1.5 bg-white/20 rounded-full relative cursor-pointer" onclick={handleVolume} role="slider" tabindex="0">
            <div class="absolute top-0 left-0 h-full bg-white rounded-full pointer-events-none" style="width: {volume}%"></div>
            <div class="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md scale-[1.5] pointer-events-none" style="left: calc({volume}% - 4px)"></div>
          </div>
          <Volume2 size={20} />
        </div>
        
        <!-- Bottom Actions -->
        <div class="flex items-center justify-evenly text-white/70 px-4 mt-auto">
          <button class="bg-transparent border-none text-current cursor-pointer hover:text-white"><MessageSquareQuote size={20} /></button>
          <button class="bg-transparent border-none text-current cursor-pointer hover:text-white"><Airplay size={20} /></button>
          <button class="bg-transparent border-none text-current cursor-pointer hover:text-white"><ListMusic size={22} /></button>
        </div>
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto px-4 pt-[54px] pb-5">
      {#if currentTab === 'listen_now'}
        <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4">
          Listen Now
        </h1>
        {#if tracks.length === 0}
          <div class="flex justify-center py-20">
            <div
              class="w-8 h-8 border-2 border-ios-label2 border-t-white rounded-full animate-spin"
            ></div>
          </div>
        {:else}
          <div class="mb-5">
            <h2 class="text-[22px] font-bold text-white mb-3">Top Tracks</h2>
            <div
              class="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
            >
              {#each tracks.slice(0, 8) as t}
                <button
                  class="min-w-[150px] bg-transparent border-none cursor-pointer text-left p-0"
                  onclick={() => play(t)}
                >
                  <img
                    src={t.art}
                    alt={t.name}
                    class="w-[150px] h-[150px] rounded-xl object-cover"
                  />
                  <div
                    class="text-[13px] font-medium text-white mt-1.5 truncate w-[150px]"
                  >
                    {t.name}
                  </div>
                  <div class="text-[11px] text-ios-label2 truncate w-[150px]">
                    {t.artist}
                  </div>
                </button>
              {/each}
            </div>
          </div>
          <div class="bg-ios-bg2 rounded-xl overflow-hidden mb-5">
            {#each tracks as t, i}
              <button
                class="flex gap-3 p-2 px-3 w-full border-none bg-transparent cursor-pointer text-left text-white items-center"
                onclick={() => play(t)}
              >
                <img
                  src={t.art}
                  alt={t.name}
                  class="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <div class="text-[16px] truncate">{t.name}</div>
                  <div class="text-[13px] text-ios-label2 truncate">
                    {t.artist}
                  </div>
                </div>
                <Play size={18} class="text-ios-pink" fill="currentColor" />
              </button>
              {#if i < tracks.length - 1}<div
                  class="h-px bg-ios-sep ml-[68px]"
                ></div>{/if}
            {/each}
          </div>
        {/if}
      {:else if currentTab === 'search'}
        <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-2">Search</h1>
        <div class="px-1 pb-4">
          <input 
            type="text" 
            placeholder="Artists, Songs, Lyrics, and More" 
            bind:value={searchQuery} 
            onkeydown={(e) => e.key === 'Enter' && doSearch()} 
            class="w-full bg-[#1c1c1e] text-white placeholder-white/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ios-pink" 
          />
        </div>
        {#if isSearching}
           <div class="flex justify-center py-10">
             <div class="w-8 h-8 border-2 border-ios-label2 border-t-white rounded-full animate-spin"></div>
           </div>
        {:else if searchResults.length > 0}
           <div class="bg-ios-bg2 rounded-xl overflow-hidden mb-5">
             {#each searchResults as t, i}
                <button
                  class="flex gap-3 p-2 px-3 w-full border-none bg-transparent cursor-pointer text-left text-white items-center"
                  onclick={() => { tracks = searchResults; play(t); }}
                >
                  <img src={t.art} alt={t.name} class="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div class="flex-1 min-w-0">
                    <div class="text-[16px] truncate">{t.name}</div>
                    <div class="text-[13px] text-ios-label2 truncate">{t.artist}</div>
                  </div>
                  <Play size={18} class="text-ios-pink" fill="currentColor" />
                </button>
                {#if i < searchResults.length - 1}<div class="h-px bg-ios-sep ml-[68px]"></div>{/if}
             {/each}
           </div>
        {/if}
      {:else}
        <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4 capitalize">{currentTab}</h1>
        <div class="text-white/50 px-2 mt-4 text-center">
          <div class="text-[17px] font-medium text-white mb-2">Coming Soon</div>
          This section is currently under development.
        </div>
      {/if}
    </div>
    
    <!-- Apple Music Bottom Navigation -->
    <div class="flex items-center justify-between px-6 pt-3 pb-8 bg-[#1c1c1e] border-t border-white/10 w-full shrink-0">
      <button class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {currentTab === 'listen_now' ? 'text-ios-pink' : 'text-white/50 hover:text-white/80 transition-colors'}" onclick={() => currentTab = 'listen_now'}>
        <PlayCircle size={24} />
        <span class="text-[10px] font-medium">Listen Now</span>
      </button>
      <button class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {currentTab === 'browse' ? 'text-ios-pink' : 'text-white/50 hover:text-white/80 transition-colors'}" onclick={() => currentTab = 'browse'}>
        <LayoutGrid size={24} />
        <span class="text-[10px] font-medium">Browse</span>
      </button>
      <button class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {currentTab === 'radio' ? 'text-ios-pink' : 'text-white/50 hover:text-white/80 transition-colors'}" onclick={() => currentTab = 'radio'}>
        <Radio size={24} />
        <span class="text-[10px] font-medium">Radio</span>
      </button>
      <button class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {currentTab === 'library' ? 'text-ios-pink' : 'text-white/50 hover:text-white/80 transition-colors'}" onclick={() => currentTab = 'library'}>
        <ListMusic size={24} />
        <span class="text-[10px] font-medium">Library</span>
      </button>
      <button class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {currentTab === 'search' ? 'text-ios-pink' : 'text-white/50 hover:text-white/80 transition-colors'}" onclick={() => currentTab = 'search'}>
        <Search size={24} />
        <span class="text-[10px] font-medium">Search</span>
      </button>
    </div>
  {/if}

  {#if current && !showPlayer}
    <div
      class="flex gap-3 items-center px-3 py-2 bg-ios-bg2 border-t border-ios-sep cursor-pointer text-white text-left w-full"
      role="button"
      tabindex="0"
      onclick={() => (showPlayer = true)}
      onkeydown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") showPlayer = true;
      }}
    >
      <img
        src={current.art}
        alt={current.name}
        class="w-11 h-11 rounded-lg object-cover"
      />
      <div class="flex-1 min-w-0">
        <div class="text-[15px] truncate">{current.name}</div>
        <div class="text-[12px] text-ios-label2 truncate">{current.artist}</div>
      </div>
      <button
        class="bg-transparent border-none cursor-pointer text-white"
        onclick={(e: MouseEvent) => {
          e.stopPropagation();
          togglePlay();
        }}
        aria-label="Play/Pause"
      >
        {#if playing}<Pause size={22} />{:else}<Play size={22} />{/if}
      </button>
    </div>
  {/if}
</div>

<div id="youtube-player" style="display: none;"></div>
