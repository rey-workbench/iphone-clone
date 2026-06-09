export class AppSafariState {
  url = $state('');
  inputUrl = $state('');
  showInput = $state(false);
  searchResults = $state<any[] | null>(null);
  isSearching = $state(false);
  searchError = $state<string | null>(null);
  isReady = $state(false);
  scramjet: any = null;
  frameObj: any = null;
  errorMessage = $state('');

  constructor() {}

  navigate(targetUrl?: string) {
    if (targetUrl) {
      this.url = targetUrl;
      this.inputUrl = targetUrl;
      this.searchResults = null;
      this.showInput = false;
      this.loadFrame();
      return;
    }

    if (this.inputUrl.trim()) {
      const input = this.inputUrl.trim();
      // Basic check if it's a domain/URL or search term
      if (input.includes('.') && !input.includes(' ')) {
        this.url = input.startsWith('http') ? input : `https://${input}`; 
        this.searchResults = null;
        this.showInput = false;
        this.loadFrame();
      } else {
        // It's a search term
        this.performSearch(input);
        this.showInput = false; 
      }
    } 
  }

  loadFrame() {
    if (this.isReady && this.scramjet) {
      setTimeout(() => {
        if (!this.frameObj) {
          const iframe = document.createElement("iframe");
          iframe.className = "absolute inset-0 w-full h-full border-none bg-white";
          this.frameObj = this.scramjet.createFrame(iframe);
          const container = document.getElementById('safari-container');
          if (container) {
            container.innerHTML = '';
            container.appendChild(iframe);
          } else {
            console.warn("[SafariState] safari-container still not found in DOM");
          }
        }
        if (this.frameObj) {
          this.frameObj.go(this.url);
        }
      }, 0);
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
    this.inputUrl = this.url || '';
  }

  goBack() {
    const iframe = document.querySelector('#safari-container iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.history.back();
    }
  }

  goForward() {
    const iframe = document.querySelector('#safari-container iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.history.forward();
    }
  }
}
