import { dialogState } from "$lib/states/dialogState.svelte";

export class AppSafariState {
  url = $state('');
  inputUrl = $state('');
  showInput = $state(false);
  searchResults = $state<any[] | null>(null);
  isSearching = $state(false);
  searchError = $state<string | null>(null);
  isReady = $state(false);
  frameObj: any = null;
  errorMessage = $state('');

  constructor() {}

  async initEngine() {
    if ("serviceWorker" in navigator) {
      try {
        // Unregister any old scramjet workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const r of registrations) {
          if (r.active?.scriptURL.includes("scramjet-sw.js")) {
            await r.unregister();
          }
        }

        const reg = await navigator.serviceWorker.register("/safari-sw.js", {
          scope: "/__proxy/",
        });

        const waitForActive = (worker: ServiceWorker | null) =>
          new Promise<void>((resolve) => {
            if (!worker) return resolve();
            if (worker.state === "activated") return resolve();
            worker.addEventListener("statechange", () => {
              if (worker.state === "activated") resolve();
            });
          });

        if (!reg.active) {
          await waitForActive(reg.installing || reg.waiting);
        }

        this.isReady = true;

        // Initialize the frame
        if (!this.frameObj && document.getElementById("safari-container")) {
          const iframe = document.createElement("iframe");
          iframe.className = "absolute inset-0 w-full h-full border-none bg-white";
          iframe.id = "safari-iframe";
          
          // Add a load listener to handle history state if needed
          iframe.addEventListener("load", () => {
             // Optional: Handle title updates or location sync
          });

          this.frameObj = {
              go: (url: string) => {
                  iframe.src = '/__proxy/' + url;
              }
          };

          document.getElementById("safari-container")!.appendChild(iframe);
          
          if (this.url) {
            this.frameObj.go(this.url);
          }
        }
      } catch (err: any) {
        dialogState.show({
          title: "Safari Proxy Error",
          message: err.message || "Failed to initialize Safari proxy.",
          confirmText: "OK",
        });
      }
    }
  }

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
    if (this.isReady) {
      setTimeout(() => {
        if (!this.frameObj) {
          const iframe = document.createElement("iframe");
          iframe.className = "absolute inset-0 w-full h-full border-none bg-white";
          iframe.id = "safari-iframe";
          
          this.frameObj = {
              go: (url: string) => {
                  iframe.src = '/__proxy/' + url;
              }
          };

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
      dialogState.show({ title: 'Safari Error', message: e.message || 'Failed to search', confirmText: 'OK' });
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
