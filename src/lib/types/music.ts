export enum EMusicItemType {
    TRACK = 'TRACK',
    PLAYLIST = 'PLAYLIST',
    ALBUM = 'ALBUM',
    ARTIST = 'ARTIST'
}

export enum EMusicAction {
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
    type?: EMusicItemType;
    thumbnails?: { url: string; width?: number; height?: number }[];
    [key: string]: any;
}

export interface IMusicSearchOptions {
    action?: EMusicAction;
    q?: string;
    type?: EMusicItemType | string;
    title?: string;
    artist?: string;
    duration?: string | number;
}
