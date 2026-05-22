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
    Search,
    Loader2,
  } from "@lucide/svelte";

  interface Track {
    name: string;
    artist: string;
    art: string;
    preview: string;
    id?: string;
  }

  let tracks: Track[] = $state([]);
  let playing = $state(false);
  let showPlayer = $state(false);
  let progress = $state(0);
  let volume = $state(60);
  let currentTab = $state("listen_now");
  let searchQuery = $state("");
  let searchResults = $state([] as any[]);
  let searchSuggestions = $state([] as string[]);
  let isSearching = $state(false);
  let showLyrics = $state(false);
  let lyricsText = $state("");
  let parsedLyrics: { time: number; text: string }[] = $state([]);
  let activeLyricIndex = $state(-1);
  let isSynced = $state(false);
  let isFetchingLyrics = $state(false);
  let lyricsContainer: HTMLElement | null = $state(null);
  
  const lyricsCache = new Map<string, { rawText: string, isSynced: boolean, parsed: any[] }>();

  let current = $state(null as any);
  let player: any = $state(null);
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

    return () => {
      clearInterval(progressInterval);
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    };
  });

  $effect(() => {
    if (currentTab === "listen_now") fetchTab("");
    else if (currentTab === "browse") fetchTab("browse");
    else if (currentTab === "radio") fetchTab("radio");
    else if (currentTab === "library") fetchTab("library");
  });

  async function fetchTab(action: string) {
    tracks = [];
    try {
      const r = await fetch(
        `/api/ytsearch${action ? "?action=" + action : ""}`,
      );
      const d = await r.json();
      if (d.results) tracks = d.results;
    } catch {
      tracks = [];
    }
  }

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

  async function play(t: any) {
    if (t.type === "PLAYLIST" || t.type === "ALBUM" || t.type === "ARTIST") {
      try {
        const r = await fetch(
          `/api/ytsearch?action=playlist_tracks&q=${t.id}&type=${t.type}`,
        );
        const d = await r.json();
        if (d.results && d.results.length > 0) {
          tracks = d.results;
          current = tracks[0];
          playTrack(current);
        }
      } catch (e) {
        console.error(e);
      }
      return;
    }
    current = t;
    playTrack(current);
    
    // If clicked song is not in the current queue, create a new radio queue!
    const inQueue = tracks.find((track: any) => track.id === t.id);
    if (!inQueue) {
      tracks = [current];
      fetchUpNext();
    }
  }

  function playTrack(t: any) {
    if (!player || typeof player.loadVideoById !== "function") return;
    showPlayer = true;
    showLyrics = false;
    lyricsText = "";
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

  $effect(() => {
    if (current && !lyricsCache.has(current.id)) {
      backgroundFetchLyrics(current);
    }
  });

  async function backgroundFetchLyrics(song: any) {
    if (!song) return;
    const songId = song.id;
    if (lyricsCache.has(songId)) return;
    
    try {
      const r = await fetch(`/api/ytsearch?action=lyrics&q=${songId}&title=${encodeURIComponent(song.name)}&artist=${encodeURIComponent(song.artist)}&duration=${song.duration || 0}`);
      const d = await r.json();
      
      let rawText = "";
      if (d.results && Array.isArray(d.results)) {
        rawText = d.results.join('\n');
      } else if (d.results && typeof d.results === 'string') {
        rawText = d.results;
      } else {
        rawText = "Lyrics not available.";
      }
      
      const isSyncedRes = d.isSynced === true;
      const parsed = isSyncedRes ? parseLRC(rawText) : [];
      
      lyricsCache.set(songId, { rawText, isSynced: isSyncedRes, parsed });
      
      if (current && current.id === songId && showLyrics) {
        applyLyricsFromCache(songId);
        isFetchingLyrics = false;
      }
    } catch {
      lyricsCache.set(songId, { rawText: "Failed to load lyrics.", isSynced: false, parsed: [] });
      if (current && current.id === songId && showLyrics) {
        applyLyricsFromCache(songId);
        isFetchingLyrics = false;
      }
    }
  }

  function applyLyricsFromCache(songId: string) {
    const cached = lyricsCache.get(songId);
    if (cached) {
      lyricsText = cached.rawText;
      isSynced = cached.isSynced;
      parsedLyrics = cached.parsed;
      activeLyricIndex = -1;
    }
  }

  async function fetchLyrics() {
    if (!current) return;
    showLyrics = !showLyrics;
    if (!showLyrics) return;
    
    if (lyricsCache.has(current.id)) {
      applyLyricsFromCache(current.id);
      isFetchingLyrics = false;
    } else {
      isFetchingLyrics = true;
      lyricsText = "";
      parsedLyrics = [];
    }
  }

  function parseLRC(lrc: string) {
    const lines = lrc.split("\n");
    const parsed = [];
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    for (const line of lines) {
      const match = timeReg.exec(line);
      if (match) {
        const min = parseFloat(match[1]);
        const sec = parseFloat(match[2]);
        const fraction = parseFloat("0." + match[3]);
        // Add a 0.3s delay (increase time requirement) because users feel it highlights too fast
        const time = min * 60 + sec + fraction + 0.3;
        const text = line.replace(timeReg, "").trim();
        parsed.push({ time, text });
      }
    }
    return parsed;
  }

  async function fetchUpNext() {
    if (!current) return;
    try {
      const r = await fetch(`/api/ytsearch?action=upnext&q=${current.id}`);
      const d = await r.json();
      if (d.results && d.results.length > 0) {
        tracks = d.results; // replace queue
        // notify user maybe? UI doesn't have toast, so it just silently replaces the queue
      }
    } catch (e) {
      console.error(e);
    }
  }

  function updateProgress() {
    if (player && player.getDuration) {
      const d = player.getDuration();
      const c = player.getCurrentTime();
      if (d > 0) progress = (c / d) * 100;

      if (showLyrics && isSynced && parsedLyrics.length > 0) {
        let newIndex = parsedLyrics.findIndex((p) => p.time > c) - 1;
        if (newIndex === -2) newIndex = parsedLyrics.length - 1;
        if (newIndex < 0 && parsedLyrics[0].time > c) newIndex = -1;

        if (newIndex !== activeLyricIndex) {
          activeLyricIndex = newIndex;
          scrollToActiveLyric();
        }
      }
    }
  }

  function scrollToActiveLyric() {
    if (!lyricsContainer) return;
    setTimeout(() => {
      const activeEl = lyricsContainer?.querySelector(
        ".active-lyric",
      ) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
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
    const formatted = `${m}:${s < 10 ? "0" : ""}${s}`;
    return isRemaining ? `-${formatted}` : formatted;
  }

  function handleSeek(e: MouseEvent) {
    if (!player || typeof player.getDuration !== "function") return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * player.getDuration();
    player.seekTo(newTime, true);
    progress = pos * 100;
  }

  function handleVolume(e: MouseEvent) {
    if (!player || typeof player.setVolume !== "function") return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    volume = pos * 100;
    player.setVolume(volume);
  }

  async function doSearch() {
    if (!searchQuery.trim()) return;
    isSearching = true;
    searchSuggestions = []; // hide suggestions when searching
    try {
      const r = await fetch(
        `/api/ytsearch?q=${encodeURIComponent(searchQuery)}`,
      );
      const d = await r.json();
      if (d.results) {
        searchResults = d.results;
      }
    } catch {
      searchResults = [];
    }
    isSearching = false;
  }

  let searchTimeout: any;
  $effect(() => {
    if (searchQuery.trim().length > 1) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        try {
          const r = await fetch(
            `/api/ytsearch?action=suggestions&q=${encodeURIComponent(searchQuery)}`,
          );
          const d = await r.json();
          if (d.results) searchSuggestions = d.results;
        } catch {}
      }, 300);
    } else {
      searchSuggestions = [];
    }
  });
</script>

<div class="h-full bg-black flex flex-col relative overflow-hidden">
  {#if showPlayer && current}
    <!-- Background Blur -->
    <div class="absolute inset-0 z-10 bg-black">
      <img
        src={current.art}
        alt="bg"
        class="absolute inset-0 w-full h-full object-cover blur-[80px] opacity-70 scale-125"
      />
      <!-- Overlay to ensure text readability -->
      <div class="absolute inset-0 bg-black/30"></div>
    </div>

    <!-- Player Content -->
    <div class="absolute inset-0 z-20 flex flex-col px-6 pt-12 pb-8">
      <!-- Drag Handle -->
      <div
        class="w-full flex justify-center mb-8"
        onclick={() => (showPlayer = false)}
        role="button"
        tabindex="0"
        onkeydown={() => {}}
      >
        <div class="w-10 h-1 bg-white/40 rounded-full"></div>
      </div>

      {#if showLyrics}
        <div
          class="flex-1 overflow-y-auto mb-10 w-full px-6 text-white text-[24px] font-bold leading-normal hide-scrollbar scroll-smooth"
          bind:this={lyricsContainer}
        >
          {#if isFetchingLyrics}
            <div class="flex justify-center py-20">
              <Loader2 class="animate-spin text-white/50" size={32} />
            </div>
          {:else if isSynced && parsedLyrics.length > 0}
            <div class="space-y-6 py-[40vh]">
              {#each parsedLyrics as line, i}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <p
                  class="transition-all duration-300 ease-out cursor-pointer {i ===
                  activeLyricIndex
                    ? 'text-white opacity-100 active-lyric'
                    : 'text-white opacity-40 blur-[0.5px]'}"
                  onclick={() => {
                    if (player && typeof player.seekTo === "function")
                      player.seekTo(line.time, true);
                  }}
                >
                  {line.text || "♪"}
                </p>
              {/each}
            </div>
          {:else}
            <div
              class="whitespace-pre-wrap py-[10vh] text-[20px] font-semibold text-white/60 text-center leading-relaxed"
            >
              <span
                class="text-xs font-normal text-white/30 uppercase tracking-widest mb-6 block"
                >Synced lyrics unavailable</span
              >
              {lyricsText}
            </div>
          {/if}
        </div>
      {:else}
        <img
          src={current.art}
          alt={current.name}
          class="w-full aspect-square rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] object-cover mb-12"
        />
      {/if}

      <div class="w-full flex-1 flex flex-col">
        <div class="w-full flex justify-between items-center mb-8">
          <div class="flex-1 min-w-0 pr-4">
            <div class="font-bold text-white text-[22px] truncate">
              {current.name}
            </div>
            <div class="text-white/70 text-[18px] truncate mt-0.5">
              {current.artist}
            </div>
          </div>
          <button
            class="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 border-none cursor-pointer"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div class="w-full mb-10">
          <div
            class="w-full h-1.5 bg-white/20 rounded-full relative cursor-pointer"
            onclick={handleSeek}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSeek(e as any);
            }}
            role="slider"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            tabindex="0"
          >
            <div
              class="absolute top-0 left-0 h-full bg-white rounded-full transition-[width] duration-200"
              style="width:{progress}%"
            ></div>
            <!-- Thumb -->
            <div
              class="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md scale-[1.5] pointer-events-none"
              style="left: calc({progress}% - 4px)"
            ></div>
          </div>
          <div
            class="flex justify-between mt-2.5 text-[11px] text-white/60 font-medium pointer-events-none"
          >
            <span
              >{formatTime(
                (progress / 100) * (player?.getDuration() || 0),
              )}</span
            >
            <span
              >{formatTime(
                (player?.getDuration() || 0) -
                  (progress / 100) * (player?.getDuration() || 0),
                true,
              )}</span
            >
          </div>
        </div>

        <div class="flex items-center justify-between px-6 mb-12">
          <button
            class="bg-transparent border-none cursor-pointer text-white hover:scale-110 transition-transform active:scale-95"
            onclick={() => playNext(-1)}
            aria-label="Previous"
            ><SkipBack size={44} fill="white" strokeWidth={0} /></button
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
            aria-label="Next"
            ><SkipForward size={44} fill="white" strokeWidth={0} /></button
          >
        </div>

        <!-- Volume Slider -->
        <div class="flex items-center gap-3 text-white/50 mb-10">
          <Volume1 size={14} />
          <div
            class="flex-1 h-1.5 bg-white/20 rounded-full relative cursor-pointer"
            onclick={handleVolume}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleVolume(e as any);
            }}
            role="slider"
            aria-valuenow={volume}
            aria-valuemin={0}
            aria-valuemax={100}
            tabindex="0"
          >
            <div
              class="absolute top-0 left-0 h-full bg-white rounded-full pointer-events-none"
              style="width: {volume}%"
            ></div>
            <div
              class="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md scale-[1.5] pointer-events-none"
              style="left: calc({volume}% - 4px)"
            ></div>
          </div>
          <Volume2 size={20} />
        </div>

        <!-- Bottom Actions -->
        <div
          class="flex items-center justify-evenly text-white/70 px-4 mt-auto"
        >
          <button
            class="bg-transparent border-none cursor-pointer {showLyrics
              ? 'text-ios-pink'
              : 'text-current hover:text-white'}"
            onclick={fetchLyrics}><MessageSquareQuote size={20} /></button
          >

          <button
            class="bg-transparent border-none text-current cursor-pointer hover:text-white"
            ><Airplay size={20} /></button
          >

          <button
            class="bg-transparent border-none text-current cursor-pointer hover:text-white active:text-ios-pink"
            onclick={fetchUpNext}><ListMusic size={22} /></button
          >
        </div>
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto px-4 pt-[54px] pb-5">
      {#if currentTab === "listen_now" || currentTab === "browse" || currentTab === "radio" || currentTab === "library"}
        <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4 capitalize">
          {currentTab.replace("_", " ")}
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
      {:else if currentTab === "search"}
        <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-2">Search</h1>
        <div class="px-1 pb-4">
          <input
            type="text"
            placeholder="Artists, Songs, Lyrics, and More"
            bind:value={searchQuery}
            onkeydown={(e) => e.key === "Enter" && doSearch()}
            class="w-full bg-[#1c1c1e] text-white placeholder-white/50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-ios-pink"
          />
        </div>
        {#if searchSuggestions.length > 0 && searchResults.length === 0 && !isSearching}
          <div class="px-2 mb-4 space-y-1">
            {#each searchSuggestions as sug}
              <button
                class="w-full text-left bg-transparent border-none text-white/80 py-2 px-2 text-[15px] cursor-pointer hover:bg-white/10 rounded-lg flex items-center gap-3"
                onclick={() => {
                  searchQuery = sug;
                  doSearch();
                }}
              >
                <Search size={16} class="text-white/40" />
                {sug}
              </button>
            {/each}
          </div>
        {/if}
        {#if isSearching}
          <div class="flex justify-center py-10">
            <div
              class="w-8 h-8 border-2 border-ios-label2 border-t-white rounded-full animate-spin"
            ></div>
          </div>
        {:else if searchResults.length > 0}
          <div class="bg-ios-bg2 rounded-xl overflow-hidden mb-5">
            {#each searchResults as t, i}
              <button
                class="flex gap-3 p-2 px-3 w-full border-none bg-transparent cursor-pointer text-left text-white items-center"
                onclick={() => {
                  tracks = searchResults;
                  play(t);
                }}
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
              {#if i < searchResults.length - 1}<div
                  class="h-px bg-ios-sep ml-[68px]"
                ></div>{/if}
            {/each}
          </div>
        {/if}
      {:else}
        <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4 capitalize">
          {currentTab}
        </h1>
        <div class="text-white/50 px-2 mt-4 text-center">
          <div class="text-[17px] font-medium text-white mb-2">Coming Soon</div>
          This section is currently under development.
        </div>
      {/if}
    </div>
  {/if}

  {#if current && !showPlayer}
    <div
      class="flex gap-3 items-center px-3 py-2 bg-[#2c2c2e] border-t border-white/10 cursor-pointer text-white text-left w-full shrink-0 z-20"
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
        class="w-11 h-11 rounded-md object-cover shadow-sm"
      />
      <div class="flex-1 min-w-0">
        <div class="text-[15px] truncate font-medium">{current.name}</div>
        <div class="text-[12px] text-white/60 truncate">{current.artist}</div>
      </div>
      <button
        class="bg-transparent border-none cursor-pointer text-white w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
        onclick={(e: MouseEvent) => {
          e.stopPropagation();
          togglePlay();
        }}
        aria-label="Play/Pause"
      >
        {#if playing}<Pause
            size={24}
            fill="white"
            strokeWidth={0}
          />{:else}<Play size={24} fill="white" strokeWidth={0} />{/if}
      </button>
      <button
        class="bg-transparent border-none cursor-pointer text-white w-8 h-8 flex items-center justify-center hover:scale-110 transition-transform"
        onclick={(e: MouseEvent) => {
          e.stopPropagation();
          playNext(1);
        }}
        aria-label="Next"
      >
        <SkipForward size={24} fill="white" strokeWidth={0} />
      </button>
    </div>
  {/if}

  {#if !showPlayer}
    <!-- Apple Music Bottom Navigation -->
    <div
      class="flex items-center justify-between px-6 pt-3 pb-8 bg-[#1c1c1e] border-t border-white/10 w-full shrink-0 z-10"
    >
      <button
        class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {currentTab ===
        'listen_now'
          ? 'text-ios-pink'
          : 'text-white/50 hover:text-white/80 transition-colors'}"
        onclick={() => (currentTab = "listen_now")}
      >
        <PlayCircle size={24} />
        <span class="text-[10px] font-medium">Listen Now</span>
      </button>
      <button
        class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {currentTab ===
        'browse'
          ? 'text-ios-pink'
          : 'text-white/50 hover:text-white/80 transition-colors'}"
        onclick={() => (currentTab = "browse")}
      >
        <LayoutGrid size={24} />
        <span class="text-[10px] font-medium">Browse</span>
      </button>
      <button
        class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {currentTab ===
        'radio'
          ? 'text-ios-pink'
          : 'text-white/50 hover:text-white/80 transition-colors'}"
        onclick={() => (currentTab = "radio")}
      >
        <Radio size={24} />
        <span class="text-[10px] font-medium">Radio</span>
      </button>
      <button
        class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {currentTab ===
        'library'
          ? 'text-ios-pink'
          : 'text-white/50 hover:text-white/80 transition-colors'}"
        onclick={() => (currentTab = "library")}
      >
        <ListMusic size={24} />
        <span class="text-[10px] font-medium">Library</span>
      </button>
      <button
        class="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer {currentTab ===
        'search'
          ? 'text-ios-pink'
          : 'text-white/50 hover:text-white/80 transition-colors'}"
        onclick={() => (currentTab = "search")}
      >
        <Search size={24} />
        <span class="text-[10px] font-medium">Search</span>
      </button>
    </div>
  {/if}
</div>

<div id="youtube-player" style="display: none;"></div>
