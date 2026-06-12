<script lang="ts">
  import { untrack, getContext } from 'svelte';
  import { MusicState } from "./MusicState.svelte";
  import MusicPlayer from "./components/MusicPlayer.svelte";
  import MusicLibrary from "./components/MusicLibrary.svelte";
  import MusicBottomNav from "./components/MusicBottomNav.svelte";
  import MusicMiniPlayer from "./components/MusicMiniPlayer.svelte";

  const isPreview = getContext('isPreview');
  const state = new MusicState();

  $effect(() => {
    if (isPreview) return;

    // Load YouTube API
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      (window as any).onYouTubeIframeAPIReady = () => {
        state.initPlayer(window);
      };
    } else {
      state.initPlayer(window);
    }

    return () => {
      state.destroyPlayer();
    };
  });

  $effect(() => {
    const tab = state.activeTab;
    untrack(() => {
      if (isPreview) return;
      if (tab === "listen_now") state.fetchTab("");
      else if (tab === "browse") state.fetchTab("browse");
      else if (tab === "radio") state.fetchTab("radio");
      else if (tab === "library") state.fetchTab("library");
    });
  });

  $effect(() => {
    const current = state.current;
    untrack(() => {
      if (isPreview) return;
      if (current && !state.lyricsCache.has(current.id)) {
        state.backgroundFetchLyrics(current);
      }
    });
  });

  $effect(() => {
    const q = state.searchQuery;
    untrack(() => {
      if (isPreview) return;
      state.handleSearchInput();
    });
  });
</script>

<div class="h-full bg-black flex flex-col relative overflow-hidden">
  <!-- HIDDEN YOUTUBE PLAYER -->
  <div id="youtube-player" class="absolute opacity-0 pointer-events-none w-0 h-0"></div>

  {#if state.showPlayer && state.current}
    <MusicPlayer {state} />
  {:else}
    <MusicLibrary {state} />
  {/if}

  {#if state.current && !state.showPlayer}
    <MusicMiniPlayer {state} />
  {/if}

  {#if !state.showPlayer}
    <MusicBottomNav {state} />
  {/if}
</div>
