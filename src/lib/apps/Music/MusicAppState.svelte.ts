import { MusicApiClient } from '$lib/client/services/MusicApiClient';
import { EMusicItemType, type IMusicTrack, EMusicAction } from "$lib/types/music";
import { dialogGlobalState } from "$lib/os/states/dialogGlobalState.svelte";
import type { IAppLifecycle } from "$lib/types/app";
import { osMediator } from "$lib/os/mediator.svelte";

export class MusicAppState implements IAppLifecycle {
    appName = 'Music';
    isForeground = $state(false);

    activeTab = $state("listen_now");
    searchQuery = $state("");
    searchResults = $state<IMusicTrack[]>([]);
    searchSuggestions = $state<string[]>([]);
    isSearching = $state(false);
    
    showLyrics = $state(false);
    lyricsText = $state("");
    parsedLyrics = $state<{ time: number; text: string }[]>([]);
    activeLyricIndex = $state(-1);
    isSynced = $state(false);
    isFetchingLyrics = $state(false);
    
    lyricsCache = new Map<string, { rawText: string, isSynced: boolean, parsed: any[], offset?: number }>();
    
    current = $state<IMusicTrack | null>(null);
    player = $state<any>(null);
    isPlaying = $state(false);
    progress = $state(0);
    isReady = $state(false);
    showPlayer = $state(false);
    tracks = $state<IMusicTrack[]>([]);
    volume = $state(60);
    
    progressInterval: any;
    searchTimeout: any;

    constructor() {}

    onLaunch() {
        this.isForeground = true;
        osMediator.emit({ type: 'APP_LAUNCHED', payload: { appName: this.appName } });
    }

    onSuspend() {
        this.isForeground = false;
        osMediator.emit({ type: 'APP_SUSPENDED', payload: { appName: this.appName } });
    }

    onResume() {
        this.isForeground = true;
        osMediator.emit({ type: 'APP_LAUNCHED', payload: { appName: this.appName } });
    }

    onDestroy() {
        this.isForeground = false;
        this.destroyPlayer();
    }

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
                origin: windowObj.location.origin,
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
            if (this.current) {
                osMediator.emit({
                    type: 'MUSIC_PLAYING',
                    payload: { trackName: this.current.name, artist: this.current.artist || 'Unknown Artist', isPlaying: true }
                });
            }
        } else {
            this.isPlaying = false;
            clearInterval(this.progressInterval);
            if (this.current) {
                osMediator.emit({
                    type: 'MUSIC_PLAYING',
                    payload: { trackName: this.current.name, artist: this.current.artist || 'Unknown Artist', isPlaying: false }
                });
            }
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
            const r = await MusicApiClient.search({ action: action as EMusicAction });
            if (r && r.results) this.tracks = r.results;
        } catch {
            this.tracks = [];
        }
    }

    async doSearch() {
        if (!this.searchQuery.trim()) return;
        this.isSearching = true;
        this.searchSuggestions = [];
        try {
            const r = await MusicApiClient.search({ q: this.searchQuery });
            if (r && r.results) this.searchResults = r.results;
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
                    const r = await MusicApiClient.search({ action: EMusicAction.SUGGESTIONS, q: this.searchQuery });
                    if (r && r.results) this.searchSuggestions = r.results;
                } catch {}
            }, 300);
        } else {
            this.searchSuggestions = [];
        }
    }

    async play(t: IMusicTrack) {
        if (t.type === EMusicItemType.PLAYLIST || t.type === EMusicItemType.ALBUM || t.type === EMusicItemType.ARTIST) {
            try {
                const r = await MusicApiClient.search({ action: EMusicAction.PLAYLIST_TRACKS, q: t.id, type: t.type });
                if (r && r.results && r.results.length > 0) {
                    this.tracks = r.results;
                    this.current = this.tracks[0];
                    this.playTrack(this.current);
                }
            } catch (e: any) {
                dialogGlobalState.show({ title: 'Playback Error', message: e.message || 'Failed to load playlist.', confirmText: 'OK' });
            }
            return;
        }
        
        this.current = t;
        this.playTrack(this.current);
        
        const inQueue = this.tracks.find((track: IMusicTrack) => track.id === t.id);
        if (!inQueue) {
            this.tracks = [this.current];
            this.fetchUpNext();
        }
    }

    playTrack(t: IMusicTrack) {
        const vidId = t.videoId || t.id;
        if (!vidId) return;
        this.current = t;
        
        this.showPlayer = true;
        this.showLyrics = false;
        this.lyricsText = "";
        
        osMediator.emit({
            type: 'MUSIC_PLAYING',
            payload: { trackName: t.name, artist: t.artist || 'Unknown Artist', isPlaying: true }
        });
        
        const tryPlay = (retries = 5) => {
            if (this.player && typeof this.player.loadVideoById === "function") {
                this.player.loadVideoById(vidId);
                this.player.playVideo();
            } else if (retries > 0) {
                setTimeout(() => tryPlay(retries - 1), 500);
            }
        };
        
        tryPlay();
    }

    togglePlay() {
        if (!this.player) return;
        if (this.isPlaying) this.player.pauseVideo();
        else this.player.playVideo();
    }

    playNext(dir: number) {
        if (!this.current || this.tracks.length === 0) return;
        const idx = this.tracks.findIndex((t: IMusicTrack) => t.id === this.current?.id);
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
            const r = await MusicApiClient.search({ action: EMusicAction.UPNEXT, q: this.current.id });
            if (r && r.results && r.results.length > 0) {
                this.tracks = r.results;
            }
        } catch (e: any) {
            dialogGlobalState.show({ title: 'Up Next Error', message: e.message || 'Failed to load upcoming tracks.', confirmText: 'OK' });
        }
    }

    async backgroundFetchLyrics(song: any) {
        if (!song) return;
        const songId = song.id;
        if (this.lyricsCache.has(songId)) return;
        
        try {
            const d = await MusicApiClient.search({ 
                action: EMusicAction.LYRICS, 
                q: songId, 
                title: song.name, 
                artist: song.artist, 
                duration: song.duration || 0 
            });
            
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

    adjustLyricsOffset(delta: number) {
        if (!this.current || !this.lyricsCache.has(this.current.id)) return;
        const cached = this.lyricsCache.get(this.current.id);
        if (cached && cached.isSynced) {
            cached.offset = (cached.offset || 0) + delta;
            // Reparse with new offset
            cached.parsed = this.parseLRC(cached.rawText, cached.offset);
            this.parsedLyrics = cached.parsed;
        }
    }

    parseLRC(lrc: string, offset: number = 0) {
        const lines = lrc.split("\n");
        const parsed = [];
        const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
        for (const line of lines) {
            const match = timeReg.exec(line);
            if (match) {
                const min = parseFloat(match[1]);
                const sec = parseFloat(match[2]);
                const fraction = parseFloat("0." + match[3]);
                // Highlight lyrics 400ms early (+ user offset) so it feels synced/anticipates the beat
                const time = min * 60 + sec + fraction - 0.4 + offset;
                const text = line.replace(timeReg, "").trim();
                parsed.push({ time, text });
            }
        }
        return parsed;
    }
}
