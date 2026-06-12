<script lang="ts">
  import { netflixState } from "../NetflixState.svelte";
  import { systemState } from "$lib/states";
  import Skeleton from "$lib/os/components/ui/Skeleton.svelte";

  let { handleScroll } = $props<{ handleScroll: (e: Event) => void }>();

  let top10Movies = $derived(netflixState.movies.slice(0, 10));

  const handleSelectMovie = (e: MouseEvent) => {
    const id = (e.currentTarget as HTMLElement).dataset.id;
    if (id) {
      const movie = netflixState.movies.find((m) => String(m.id) === id);
      if (movie) netflixState.selectMedia(movie);
    }
  };

  const handleSelectTv = (e: MouseEvent) => {
    const id = (e.currentTarget as HTMLElement).dataset.id;
    if (id) {
      const tv = netflixState.tvShows.find((t) => String(t.id) === id);
      if (tv) netflixState.selectMedia(tv);
    }
  };

  const handlePlayHero = () => {
    if (netflixState.movies.length > 0) {
      netflixState.selectMedia(netflixState.movies[0]);
    }
  };
</script>

<div
  class="flex-1 overflow-y-auto pb-20 no-scrollbar relative z-10"
  onscroll={handleScroll}
>
  <!-- Hero Banner -->
  {#if netflixState.movies.length > 0}
    <div class="relative w-full h-137.5">
      <img
        src={netflixState.movies[0].poster_path}
        alt={netflixState.movies[0].title}
        class="w-full h-full object-cover object-center"
      />
      <div
        class="absolute inset-0 bg-linear-to-t from-ios-bg via-transparent to-ios-bg/40"
      ></div>

      <div
        class="absolute bottom-0 left-0 w-full pb-6 flex flex-col items-center gap-4"
      >
        <h1
          class="text-5xl font-black text-center tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] px-4 leading-none uppercase"
        >
          {netflixState.movies[0].title}
        </h1>

        <div
          class="text-[11px] font-semibold text-white drop-shadow-md tracking-wider"
        >
          Exciting • Reality TV • Competition
        </div>

        <div class="flex items-center justify-center gap-8 w-full mt-2">
          <button
            class="flex flex-col items-center gap-1 bg-transparent border-none text-white hover:text-gray-300 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><line x1="12" x2="12" y1="5" y2="19" /><line
                x1="5"
                x2="19"
                y1="12"
                y2="12"
              /></svg
            >
            <span class="text-[10px] font-medium">My List</span>
          </button>

          <button
            class="bg-white text-black font-bold border-none cursor-pointer py-2 px-8 rounded flex items-center justify-center gap-2 hover:bg-white/80 transition-colors"
            onclick={handlePlayHero}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"><path d="M8 5v14l11-7z" /></svg
            >
            Play
          </button>

          <button
            class="flex flex-col items-center gap-1 bg-transparent border-none text-white cursor-pointer hover:text-gray-300"
            onclick={handlePlayHero}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path
                d="M12 8h.01"
              /></svg
            >
            <span class="text-[10px] font-medium">Info</span>
          </button>
        </div>
      </div>
    </div>
  {:else}
    <div class="relative w-full h-137.5">
      <Skeleton width="100%" height="100%" />
      <div
        class="absolute bottom-0 left-0 w-full pb-6 flex flex-col items-center gap-4"
      >
        <Skeleton width="60%" height="48px" />
        <Skeleton width="80%" height="16px" />
        <div class="flex items-center justify-center gap-8 w-full mt-2">
          <Skeleton width="32px" height="40px" />
          <Skeleton width="120px" height="40px" borderRadius="4px" />
          <Skeleton width="32px" height="40px" />
        </div>
      </div>
    </div>
  {/if}

  <div class="flex flex-col gap-8 mt-2">
    <div class="w-full">
      <h2 class="text-[15px] font-bold px-4 mb-2 text-gray-100">
        Continue Watching for {systemState.currentUser?.name?.split(
          " "
        )[0] || "Guest"}
      </h2>
      <div class="flex overflow-x-auto px-4 pb-2 gap-2 no-scrollbar snap-x">
        {#if top10Movies.length === 0}
          {#each Array(4) as _, i (i)}
            <div
              class="relative flex-none w-26.25 h-38.75 rounded overflow-hidden snap-start bg-[#222]"
            >
              <Skeleton width="100%" height="100%" />
            </div>
          {/each}
        {:else}
          {#each top10Movies.slice(0, 4) as movie (movie.id)}
            <button
              data-id={movie.id}
              class="relative flex-none w-26.25 h-38.75 rounded overflow-hidden bg-[#222] border-none p-0 cursor-pointer snap-start transition-transform hover:scale-105"
              onclick={handleSelectMovie}
              aria-label="Watch {movie.title}"
            >
              <div class="absolute top-1 left-1 z-10 w-3 h-4">
                <img
                  src="/assets/icons/netflix-brand-logo.png"
                  alt="N"
                  class="w-full h-full object-contain"
                />
              </div>
              <img
                src={movie.poster_path}
                alt={movie.title}
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                class="absolute inset-0 bg-black/30 flex items-center justify-center"
              >
                <div
                  class="w-10 h-10 rounded-full border border-white flex items-center justify-center bg-black/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="white"
                    class="ml-0.5"><path d="M8 5v14l11-7z" /></svg
                  >
                </div>
              </div>
              <div class="absolute bottom-0 left-0 w-full h-0.75 bg-gray-600">
                <div class="h-full bg-[#E50914] w-1/3"></div>
              </div>
            </button>
          {/each}
        {/if}
      </div>
    </div>

    <div class="w-full overflow-hidden">
      <h2 class="text-[15px] font-bold px-4 mb-2 text-gray-100">
        Top 10 TV Shows Today
      </h2>
      <div class="flex overflow-x-auto px-4 pb-4 gap-0 no-scrollbar snap-x">
        {#if netflixState.tvShows.length === 0}
          {#each Array(3) as _, i (i)}
            <div
              class="relative flex-none w-33.75 h-41.25 flex items-end justify-end overflow-visible snap-start"
            >
              <div class="w-27.5 h-41.25 relative z-10 rounded overflow-hidden">
                <Skeleton width="100%" height="100%" />
              </div>
            </div>
          {/each}
        {:else}
          {#each netflixState.tvShows.slice(0, 10) as tv, i (tv.id)}
            <button
              data-id={tv.id}
              class="relative flex-none border-none p-0 bg-transparent cursor-pointer w-33.75 h-41.25 flex items-end justify-end overflow-visible snap-start transition-transform hover:scale-105"
              onclick={handleSelectTv}
              aria-label="View {tv.title}"
            >
              <div
                class="absolute left-4 -bottom-2 text-[85px] font-black text-black z-20 tracking-tighter drop-shadow-md"
                style:-webkit-text-stroke="3px white" style:color="black" style:line-height="0.8" style:font-family="Impact, sans-serif"
              >
                {i + 1}
              </div>
              <div class="w-27.5 h-41.25 relative z-10 rounded overflow-hidden">
                <img
                  src={tv.poster_path}
                  alt={tv.title}
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <div class="absolute top-1 left-1 z-10 w-3 h-4">
                  <img
                    src="/assets/icons/netflix-brand-logo.png"
                    alt="N"
                    class="w-full h-full object-contain"
                  />
                </div>
                <div
                  class="absolute top-0 right-0 bg-[#E50914] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl tracking-wider shadow-md"
                >
                  TOP<br />10
                </div>
              </div>
            </button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>
