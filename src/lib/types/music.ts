export enum MusicItemType {
    TRACK = 'TRACK',
    PLAYLIST = 'PLAYLIST',
    ALBUM = 'ALBUM',
    ARTIST = 'ARTIST'
}

export enum MusicAction {
    SUGGESTIONS = 'suggestions',
    PLAYLIST_TRACKS = 'playlist_tracks',
    ARTIST = 'artist',
    UPNEXT = 'upnext',
    RADIO = 'radio',
    LYRICS = 'lyrics'
}

export interface IMusicTrack {
    id: string;
    videoId?: string;
    name: string;
    title?: string;
    artist: string;
    duration?: number;
    type?: MusicItemType;
    thumbnails?: { url: string; width?: number; height?: number }[];
    [key: string]: any;
}

export interface IMusicSearchOptions {
    action?: MusicAction;
    q?: string;
    type?: MusicItemType | string;
    title?: string;
    artist?: string;
    duration?: string | number;
}
