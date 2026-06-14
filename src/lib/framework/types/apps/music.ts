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
	art?: string;
	album?: string;
}

export interface IYouTubePlayer {
	loadVideoById(id: string): void;
	playVideo(): void;
	pauseVideo(): void;
	seekTo(seconds: number, allowSeekAhead: boolean): void;
	setVolume(volume: number): void;
	getVolume(): number;
	getCurrentTime(): number;
	getDuration(): number;
	getPlayerState(): number;
	destroy(): void;
}

export interface IYouTubeEvent {
	data: number;
	target: IYouTubePlayer;
}

export interface IWindowWithYouTube extends Window {
	YT?: {
		Player: new (elementId: string, options: Record<string, unknown>) => IYouTubePlayer;
		PlayerState: {
			PLAYING: number;
			ENDED: number;
			PAUSED: number;
		};
	};
	onYouTubeIframeAPIReady?: () => void;
}

export interface IMusicSearchOptions {
	action?: EMusicAction;
	q?: string;
	type?: EMusicItemType | string;
	title?: string;
	artist?: string;
	duration?: string | number;
}
