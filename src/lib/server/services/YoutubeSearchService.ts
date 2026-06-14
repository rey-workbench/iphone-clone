import YTMusic from 'ytmusic-api';

export class YoutubeSearchService {
    private ytmusic: YTMusic;
    private initialized: boolean = false;

    constructor() {
        this.ytmusic = new YTMusic();
    }

    private async ensureInitialized() {
        if (!this.initialized) {
            await this.ytmusic.initialize();
            this.initialized = true;
        }
    }

    async getSuggestions(query: string) {
        await this.ensureInitialized();
        const suggestions = await this.ytmusic.getSearchSuggestions(query);
        return { results: suggestions };
    }

    async getLyrics(query: string, title?: string | null, artist?: string | null, duration?: string | null) {
        await this.ensureInitialized();
        let synced = null;

        if (title && artist) {
            try {
                const { Client } = await import('lrclib-api');
                const lrcClient = new Client();
                let match: any;
                
                if (duration) {
                    try {
                        match = await lrcClient.findLyrics({ track_name: title, artist_name: artist, duration: parseInt(duration) });
                    } catch { /* duration match failed, try general search */ }
                }
                
                if (!match) {
                    const lrcData = await lrcClient.searchLyrics({ query: artist + ' ' + title });
                    if (lrcData && lrcData.length > 0) {
                        match = lrcData.find((t: any) => t.syncedLyrics) || lrcData[0];
                    }
                }

                if (match && match.syncedLyrics) synced = match.syncedLyrics;
                else if (match && match.plainLyrics) synced = match.plainLyrics;
            } catch { /* lrclib not available, fallback to ytmusic */ }
        }

        if (synced) {
            return { results: synced, isSynced: synced.includes('[00:') };
        }

        const lyrics = await this.ytmusic.getLyrics(query);
        return { results: lyrics, isSynced: false };
    }

    async getUpNext(query: string) {
        await this.ensureInitialized();
        const upnext = await this.ytmusic.getUpNexts(query);
        const results = upnext.map((s: any) => ({
            name: s.title,
            artist: typeof s.artists === 'string' ? s.artists : (s.artists?.map?.((a: any) => a.name).join(', ') || 'Unknown'),
            art: s.thumbnail || s.thumbnails?.[s.thumbnails.length - 1]?.url || '',
            preview: `https://music.youtube.com/watch?v=${s.videoId}`,
            id: s.videoId,
            type: 'SONG'
        }));
        return { results };
    }

    async getPlaylistTracks(query: string, type: string | null) {
        await this.ensureInitialized();
        let plist: any[];
        
        if (type === 'ALBUM') {
            const album = await this.ytmusic.getAlbum(query);
            plist = album.songs || [];
        } else if (type === 'ARTIST') {
            const artist = await this.ytmusic.getArtistSongs(query);
            plist = artist || [];
        } else {
            let pid = query;
            // Fix for standard YouTube playlists
            if (pid.startsWith('RD')) pid = 'VL' + pid;
            plist = await this.ytmusic.getPlaylistVideos(pid);
        }

        const results = plist.map((s: any) => ({
            name: s.name,
            artist: s.artist?.name || 'YouTube',
            art: s.thumbnails?.[s.thumbnails.length - 1]?.url || '',
            preview: `https://music.youtube.com/watch?v=${s.videoId}`,
            id: s.videoId,
            type: s.type || 'SONG'
        }));
        return { results };
    }

    async searchOrBrowse(query: string | null, action: string | null) {
        await this.ensureInitialized();
        let songs: any[] = [];
        
        if (!query || action === 'browse' || action === 'library' || action === 'radio') {
            const sections = await this.ytmusic.getHomeSections();
            sections.forEach((section: any) => {
                section.contents?.forEach((item: any) => {
                    if (item && item.type && ['SONG', 'VIDEO', 'PLAYLIST', 'ALBUM', 'ARTIST'].includes(item.type)) {
                        songs.push(item);
                    }
                });
            });
            if (action === 'radio') {
                songs = songs.sort(() => Math.random() - 0.5);
            }
        } else {
            songs = await this.ytmusic.search(query);
            songs = songs.sort((a: any, b: any) => {
                if (a.type === 'SONG' && b.type !== 'SONG') return -1;
                if (a.type !== 'SONG' && b.type === 'SONG') return 1;
                return 0;
            });
        }
        
        const results = songs.slice(0, 40).map((s: any) => ({
            name: s.name,
            artist: s.artist?.name || (s.type === 'PLAYLIST' ? 'Playlist' : s.type === 'ARTIST' ? 'Artist' : 'YouTube'),
            art: s.thumbnails?.[s.thumbnails.length - 1]?.url || '',
            preview: `https://music.youtube.com/watch?v=${s.videoId}`,
            id: s.videoId || s.playlistId || s.albumId || s.artistId,
            type: s.type || 'SONG',
            duration: s.duration || 0
        }));
        
        return { results };
    }
}
