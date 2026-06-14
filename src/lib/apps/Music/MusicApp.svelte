<script lang="ts">
  import { untrack, getContext } from 'svelte';
  import { musicGlobalState } from "./MusicAppState.svelte";
  import MusicPlayer from "./components/MusicPlayer.svelte";
  import MusicLibrary from "./components/MusicLibrary.svelte";
  import MusicBottomNav from "./components/MusicBottomNav.svelte";
  import MusicMiniPlayer from "./components/MusicMiniPlayer.svelte";
  import AppContainer from '$lib/os/components/ui/AppContainer.svelte';

  const isPreview = getContext('isPreview');
  const state = musicGlobalState;

  $effect(() => {
    if (isPreview) return;

    const win = window as unknown as import('$lib/types').IWindowWithYouTube;
    if (!win.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      win.onYouTubeIframeAPIReady = () => {
        state.initPlayer(win);
      };
    } else {
      state.initPlayer(window);
    }
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
    void state.searchQuery;
    untrack(() => {
      if (isPreview) return;
      state.handleSearchInput();
    });
  });
</script>

<AppContainer appName="Music" bgClass="bg-black" paddingTop="pt-0" paddingBottom="pb-0" class="relative overflow-hidden">

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
</AppContainer>
