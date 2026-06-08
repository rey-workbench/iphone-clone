export class AppSafariState {
  url = $state('https://en.wikipedia.org/wiki/Main_Page');
  inputUrl = $state('https://en.wikipedia.org/wiki/Main_Page');
  showInput = $state(false);
  searchResults = $state<any[] | null>(null);
  isSearching = $state(false);
  searchError = $state<string | null>(null);
  isReady = $state(false);

  constructor() {}

  get iframeUrl() {
    if (!this.isReady) return '';
    try {
      return (window as any).__uv$config.prefix + (window as any).__uv$config.encodeUrl(this.url);
    } catch {
      return '';
    }
  }

  navigate() { 
    if (this.inputUrl.trim()) {
      const input = this.inputUrl.trim();
      // Basic check if it's a domain/URL or search term
      if (input.includes('.') && !input.includes(' ')) {
        this.url = input.startsWith('http') ? input : `https://${input}`; 
        this.searchResults = null;
      } else {
        // It's a search term
        this.performSearch(input);
      }
      this.showInput = false; 
    } 
  }

  async performSearch(query: string) {
    this.isSearching = true;
    this.searchResults = null;
    this.searchError = null;
    try {
      const res = await fetch(`/api/safari-search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to search');
      this.searchResults = data.data || [];
    } catch (e: any) {
      console.error('Search error:', e);
      this.searchError = e.message;
    } finally {
      this.isSearching = false;
    }
  }

  toggleInput() {
    this.showInput = true;
    this.inputUrl = ''; // Clear input to type easily
  }
}
