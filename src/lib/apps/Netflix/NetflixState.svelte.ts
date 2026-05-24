import { systemState } from "$lib/states/systemState.svelte";

export class NetflixState {
  view = $state<'home' | 'detail' | 'player'>('home');
  selectedMedia = $state<any | null>(null);

  // We can fetch TMDB data directly from client using a public proxy or user key if provided.
  // For the sake of this mock app, if TMDB key is absent, we can provide a few mock trending items,
  // or instruct the user to configure the backend endpoint later.
  
  // To keep it functional without a key immediately, we'll try to fetch from TMDB 
  // using a proxy if possible, or fallback.
  movies = $state<any[]>([]);
  tvShows = $state<any[]>([]);
  isLoading = $state(false);

  constructor() {
    this.fetchTrending();
  }

  async fetchTrending() {
    this.isLoading = true;
    try {

      const res = await fetch('/api/netflix/latest');
      if (res.ok) {
        const data = await res.json();
        this.movies = data.movies || [];
        this.tvShows = data.tv || [];
      } else {
        // Fallback mock data if endpoint is not configured
        this.movies = this.getMockMovies();
        this.tvShows = this.getMockTv();
      }
    } catch(e) {
      this.movies = this.getMockMovies();
      this.tvShows = this.getMockTv();
    }
    this.isLoading = false;
  }

  selectMedia(item: any) {
    this.selectedMedia = item;
    this.view = 'detail';
  }

  playMedia() {
    this.view = 'player';
  }

  goBack() {
    if (this.view === 'player') {
      this.view = 'detail';
    } else if (this.view === 'detail') {
      this.view = 'home';
      this.selectedMedia = null;
    }
  }

  // Mock data for immediate preview
  getMockMovies() {
    return [
      { id: 597, title: "Titanic", overview: "101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic.", poster_path: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", backdrop_path: "https://image.tmdb.org/t/p/w500/rzdPqYx7Um4FUZeD8ucX1mqkYBg.jpg", vote_average: 7.9, media_type: 'movie' },
      { id: 157336, title: "Interstellar", overview: "The adventures of a group of explorers who make use of a newly discovered wormhole.", poster_path: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", backdrop_path: "https://image.tmdb.org/t/p/w500/xJHokMbljvjSCi5x2uixwsqV431.jpg", vote_average: 8.4, media_type: 'movie' },
      { id: 293660, title: "Deadpool", overview: "The origin story of former Special Forces operative turned mercenary Wade Wilson.", poster_path: "https://image.tmdb.org/t/p/w500/3E53WEZJqP6aM84D8CckDx4Np1E.jpg", backdrop_path: "https://image.tmdb.org/t/p/w500/7aPrv2HFssWcOtpiggNEY46jc.jpg", vote_average: 7.6, media_type: 'movie' },
    ];
  }

  getMockTv() {
    return [
      { id: 1396, title: "Breaking Bad", overview: "When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer...", poster_path: "https://image.tmdb.org/t/p/w500/3xnWaLQjelJDDF7LT1WBo6f4BRe.jpg", backdrop_path: "https://image.tmdb.org/t/p/w500/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg", vote_average: 8.9, media_type: 'tv' },
      { id: 66732, title: "Stranger Things", overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments.", poster_path: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8Slgw3kdA.jpg", backdrop_path: "https://image.tmdb.org/t/p/w500/56v2KjBlU4XaOv9rVYEQypROD7P.jpg", vote_average: 8.6, media_type: 'tv' },
    ];
  }
}

export const netflixState = new NetflixState();
