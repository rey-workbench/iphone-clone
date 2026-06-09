export class AppSafariState {
  url = $state('https://www.google.com/');
  inputUrl = $state('https://www.google.com/');
  showInput = $state(false);
  searchResults = $state<any[] | null>(null);
  isSearching = $state(false);
  searchError = $state<string | null>(null);
  isReady = $state(false);
  scramjet: any = null;
  frameObj: any = null;
  errorMessage = $state('');

  constructor() {}

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
        this.showInput = false; 
        return;
      }
      this.showInput = false; 

      if (this.isReady && this.scramjet) {
        if (!this.frameObj) {
          const iframe = document.createElement("iframe");
          iframe.className = "absolute inset-0 w-full h-full border-none bg-white";
          this.frameObj = this.scramjet.createFrame(iframe);
          const container = document.getElementById('safari-container');
          if (container) {
            container.innerHTML = '';
            container.appendChild(iframe);
          }
        }
        this.frameObj.go(this.url);
      }
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
