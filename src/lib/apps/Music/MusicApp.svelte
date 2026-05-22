<script lang="ts">
  import { onMount } from "svelte";
  import { MusicState } from "./MusicState.svelte";
  import MusicPlayer from "./components/MusicPlayer.svelte";
  import MusicLibrary from "./components/MusicLibrary.svelte";
  import MusicBottomNav from "./components/MusicBottomNav.svelte";
  import MusicMiniPlayer from "./components/MusicMiniPlayer.svelte";

  const state = new MusicState();

  onMount(() => {
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
    if (state.activeTab === "listen_now") state.fetchTab("");
    else if (state.activeTab === "browse") state.fetchTab("browse");
    else if (state.activeTab === "radio") state.fetchTab("radio");
    else if (state.activeTab === "library") state.fetchTab("library");
  });

  $effect(() => {
    if (state.current && !state.lyricsCache.has(state.current.id)) {
      state.backgroundFetchLyrics(state.current);
    }
  });

  $effect(() => {
    state.handleSearchInput();
  });
</script>

<div class="h-full bg-black flex flex-col relative overflow-hidden">
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

  <!-- HIDDEN YOUTUBE PLAYER -->
  <div id="youtube-player" class="hidden"></div>
</div>
