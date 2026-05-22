import { json } from '@sveltejs/kit';
import YTMusic from 'ytmusic-api';

const ytmusic = new YTMusic();
let initialized = false;

// ==========================================
// Controllers
// ==========================================

async function ensureInitialized() {
    if (!initialized) {
        await ytmusic.initialize();
        initialized = true;
    }
}

async function handleSuggestions(query: string) {
    const suggestions = await ytmusic.getSearchSuggestions(query);
    return json({ results: suggestions });
}

async function handleLyrics(url: URL, query: string) {
    const title = url.searchParams.get('title');
    const artist = url.searchParams.get('artist');
    const duration = url.searchParams.get('duration');
    let synced = null;

    if (title && artist) {
        try {
            const { Client } = await import('lrclib-api');
            const lrcClient = new Client();
            let match: any;
            
            if (duration) {
                try {
                    match = await lrcClient.findLyrics({ track_name: title, artist_name: artist, duration: parseInt(duration) });
                } catch(e) {}
            }
            
            if (!match) {
                const lrcData = await lrcClient.searchLyrics({ query: artist + ' ' + title });
                if (lrcData && lrcData.length > 0) {
                    match = lrcData.find((t: any) => t.syncedLyrics) || lrcData[0];
                }
            }

            if (match && match.syncedLyrics) synced = match.syncedLyrics;
            else if (match && match.plainLyrics) synced = match.plainLyrics;
        } catch(e) {}
    }

    if (synced) {
        return json({ results: synced, isSynced: synced.includes('[00:') });
    }

    const lyrics = await ytmusic.getLyrics(query);
    return json({ results: lyrics, isSynced: false });
}

async function handleUpNext(query: string) {
    const upnext = await ytmusic.getUpNexts(query);
    const results = upnext.map((s: any) => ({
        name: s.title,
        artist: typeof s.artists === 'string' ? s.artists : (s.artists?.map?.((a: any) => a.name).join(', ') || 'Unknown'),
        art: s.thumbnail || s.thumbnails?.[s.thumbnails.length - 1]?.url || '',
        preview: `https://music.youtube.com/watch?v=${s.videoId}`,
        id: s.videoId,
        type: 'SONG'
    }));
    return json({ results });
}

async function handlePlaylistTracks(query: string, type: string | null) {
    let plist: any[] = [];
    
    if (type === 'ALBUM') {
        const album = await ytmusic.getAlbum(query);
        plist = album.songs || [];
    } else if (type === 'ARTIST') {
        const artist = await ytmusic.getArtistSongs(query);
        plist = artist || [];
    } else {
        let pid = query;
        // Fix for standard YouTube playlists
        if (pid.startsWith('RD')) pid = 'VL' + pid;
        plist = await ytmusic.getPlaylistVideos(pid);
    }

    const results = plist.map((s: any) => ({
        name: s.name,
        artist: s.artist?.name || 'YouTube',
        art: s.thumbnails?.[s.thumbnails.length - 1]?.url || '',
        preview: `https://music.youtube.com/watch?v=${s.videoId}`,
        id: s.videoId,
        type: s.type || 'SONG'
    }));
    return json({ results });
}

async function handleSearchOrBrowse(query: string | null, action: string | null) {
    let songs: any[] = [];
    if (!query || action === 'browse' || action === 'library' || action === 'radio') {
        const sections = await ytmusic.getHomeSections();
        sections.forEach((section: any) => {
            section.contents.forEach((item: any) => {
                if (['SONG', 'VIDEO', 'PLAYLIST', 'ALBUM', 'ARTIST'].includes(item.type)) {
                    songs.push(item);
                }
            });
        });
        if (action === 'radio') {
            songs = songs.sort(() => Math.random() - 0.5);
        }
    } else {
        songs = await ytmusic.search(query);
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
    
    return json({ results });
}

// ==========================================
// Main Endpoint Router
// ==========================================

export async function GET({ url }) {
    try {
        await ensureInitialized();

        const query = url.searchParams.get('q');
        const action = url.searchParams.get('action');

        switch (action) {
            case 'suggestions':
                if (query) return await handleSuggestions(query);
                break;
            case 'lyrics':
                if (query) return await handleLyrics(url, query);
                break;
            case 'upnext':
                if (query) return await handleUpNext(query);
                break;
            case 'playlist_tracks':
                if (query) return await handlePlaylistTracks(query, url.searchParams.get('type'));
                break;
            default:
                // browse, library, radio, or default search
                return await handleSearchOrBrowse(query, action);
        }

        return json({ error: 'Invalid request or missing query parameters' }, { status: 400 });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
}
