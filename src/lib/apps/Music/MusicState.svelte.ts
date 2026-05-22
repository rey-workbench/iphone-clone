export class MusicState {
    activeTab = $state("listen_now");
    searchQuery = $state("");
    searchResults = $state<any[]>([]);
    searchSuggestions = $state<string[]>([]);
    isSearching = $state(false);
    
    showLyrics = $state(false);
    lyricsText = $state("");
    parsedLyrics = $state<{ time: number; text: string }[]>([]);
    activeLyricIndex = $state(-1);
    isSynced = $state(false);
    isFetchingLyrics = $state(false);
    
    lyricsCache = new Map<string, { rawText: string, isSynced: boolean, parsed: any[] }>();
    
    current = $state<any>(null);
    player = $state<any>(null);
    isPlaying = $state(false);
    progress = $state(0);
    isReady = $state(false);
    showPlayer = $state(false);
    tracks = $state<any[]>([]);
    volume = $state(60);
    
    progressInterval: any;
    searchTimeout: any;

    constructor() {}

    initPlayer(windowObj: any) {
        this.player = new windowObj.YT.Player("youtube-player", {
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
                onStateChange: (event: any) => this.onPlayerStateChange(event, windowObj),
            },
        });
    }

    destroyPlayer() {
        clearInterval(this.progressInterval);
        if (this.player && typeof this.player.destroy === "function") {
            this.player.destroy();
        }
    }

    onPlayerStateChange(event: any, windowObj: any) {
        if (event.data === windowObj.YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            clearInterval(this.progressInterval);
            this.progressInterval = setInterval(() => this.updateProgress(), 500);
        } else {
            this.isPlaying = false;
            clearInterval(this.progressInterval);
            if (event.data === windowObj.YT.PlayerState.ENDED) {
                this.progress = 0;
                this.playNext(1);
            }
        }
    }

    updateProgress() {
        if (this.player && this.player.getDuration) {
            const d = this.player.getDuration();
            const c = this.player.getCurrentTime();
            if (d > 0) this.progress = (c / d) * 100;

            if (this.showLyrics && this.isSynced && this.parsedLyrics.length > 0) {
                let newIndex = this.parsedLyrics.findIndex((p) => p.time > c) - 1;
                if (newIndex === -2) newIndex = this.parsedLyrics.length - 1;
                if (newIndex < 0 && this.parsedLyrics[0].time > c) newIndex = -1;

                if (newIndex !== this.activeLyricIndex) {
                    this.activeLyricIndex = newIndex;
                    this.scrollToActiveLyric();
                }
            }
        }
    }

    scrollToActiveLyric() {
        setTimeout(() => {
            const activeEl = document.querySelector(".active-lyric") as HTMLElement;
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 50);
    }

    async fetchTab(action: string) {
        this.tracks = [];
        try {
            const r = await fetch(`/api/ytsearch${action ? "?action=" + action : ""}`);
            const d = await r.json();
            if (d.results) this.tracks = d.results;
        } catch {
            this.tracks = [];
        }
    }

    async doSearch() {
        if (!this.searchQuery.trim()) return;
        this.isSearching = true;
        this.searchSuggestions = [];
        try {
            const r = await fetch(`/api/ytsearch?q=${encodeURIComponent(this.searchQuery)}`);
            const d = await r.json();
            if (d.results) this.searchResults = d.results;
        } catch {
            this.searchResults = [];
        }
        this.isSearching = false;
    }

    handleSearchInput() {
        if (this.searchQuery.trim().length > 1) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(async () => {
                try {
                    const r = await fetch(`/api/ytsearch?action=suggestions&q=${encodeURIComponent(this.searchQuery)}`);
                    const d = await r.json();
                    if (d.results) this.searchSuggestions = d.results;
                } catch {}
            }, 300);
        } else {
            this.searchSuggestions = [];
        }
    }

    async play(t: any) {
        if (t.type === "PLAYLIST" || t.type === "ALBUM" || t.type === "ARTIST") {
            try {
                const r = await fetch(`/api/ytsearch?action=playlist_tracks&q=${t.id}&type=${t.type}`);
                const d = await r.json();
                if (d.results && d.results.length > 0) {
                    this.tracks = d.results;
                    this.current = this.tracks[0];
                    this.playTrack(this.current);
                }
            } catch (e) {
                console.error(e);
            }
            return;
        }
        
        this.current = t;
        this.playTrack(this.current);
        
        const inQueue = this.tracks.find((track: any) => track.id === t.id);
        if (!inQueue) {
            this.tracks = [this.current];
            this.fetchUpNext();
        }
    }

    playTrack(t: any) {
        if (!this.player || typeof this.player.loadVideoById !== "function") return;
        this.showPlayer = true;
        this.showLyrics = false;
        this.lyricsText = "";
        
        if (this.player && typeof this.player.loadVideoById === "function") {
            this.player.loadVideoById(t.id);
            this.player.playVideo();
        } else {
            setTimeout(() => {
                if (this.player && typeof this.player.loadVideoById === "function") {
                    this.player.loadVideoById(t.id);
                    this.player.playVideo();
                }
            }, 1000);
        }
    }

    togglePlay() {
        if (!this.player) return;
        if (this.isPlaying) this.player.pauseVideo();
        else this.player.playVideo();
    }

    playNext(dir: number) {
        if (!this.current || this.tracks.length === 0) return;
        
        const idx = this.tracks.findIndex((t: any) => t.id === this.current.id);
        if (idx === -1) {
            // Jika track saat ini tidak ada di daftar tracks (misal karena diganti hasil fetchUpNext)
            const nextIdx = dir > 0 ? 0 : this.tracks.length - 1;
            const next = this.tracks[nextIdx];
            if (next) this.play(next);
            return;
        }
        
        const next = this.tracks[(idx + dir + this.tracks.length) % this.tracks.length];
        if (next) this.play(next);
    }

    async fetchUpNext() {
        if (!this.current) return;
        try {
            const r = await fetch(`/api/ytsearch?action=upnext&q=${this.current.id}`);
            const d = await r.json();
            if (d.results && d.results.length > 0) {
                this.tracks = d.results;
            }
        } catch (e) {
            console.error(e);
        }
    }

    async backgroundFetchLyrics(song: any) {
        if (!song) return;
        const songId = song.id;
        if (this.lyricsCache.has(songId)) return;
        
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
            const parsed = isSyncedRes ? this.parseLRC(rawText) : [];
            
            this.lyricsCache.set(songId, { rawText, isSynced: isSyncedRes, parsed });
            
            if (this.current && this.current.id === songId && this.showLyrics) {
                this.applyLyricsFromCache(songId);
                this.isFetchingLyrics = false;
            }
        } catch {
            this.lyricsCache.set(songId, { rawText: "Failed to load lyrics.", isSynced: false, parsed: [] });
            if (this.current && this.current.id === songId && this.showLyrics) {
                this.applyLyricsFromCache(songId);
                this.isFetchingLyrics = false;
            }
        }
    }

    applyLyricsFromCache(songId: string) {
        const cached = this.lyricsCache.get(songId);
        if (cached) {
            this.lyricsText = cached.rawText;
            this.isSynced = cached.isSynced;
            this.parsedLyrics = cached.parsed;
            this.activeLyricIndex = -1;
        }
    }

    async fetchLyrics() {
        if (!this.current) return;
        this.showLyrics = !this.showLyrics;
        if (!this.showLyrics) return;
        
        if (this.lyricsCache.has(this.current.id)) {
            this.applyLyricsFromCache(this.current.id);
            this.isFetchingLyrics = false;
        } else {
            this.isFetchingLyrics = true;
            this.lyricsText = "";
            this.parsedLyrics = [];
        }
    }

    parseLRC(lrc: string) {
        const lines = lrc.split("\n");
        const parsed = [];
        const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
        for (const line of lines) {
            const match = timeReg.exec(line);
            if (match) {
                const min = parseFloat(match[1]);
                const sec = parseFloat(match[2]);
                const fraction = parseFloat("0." + match[3]);
                const time = min * 60 + sec + fraction + 0.3;
                const text = line.replace(timeReg, "").trim();
                parsed.push({ time, text });
            }
        }
        return parsed;
    }
}
