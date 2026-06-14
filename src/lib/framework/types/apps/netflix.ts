export interface INetflixMedia {
	id: string | number;
	title?: string;
	name?: string;
	overview?: string;
	poster_path?: string;
	backdrop_path?: string;
	vote_average?: number;
	media_type?: string;
	tmdb_id?: number | string;
}

export interface INetflixSeason {
	id?: string | number;
	name?: string;
	season_number: number;
	episode_count: number;
	episodes?: any[];
}

export interface INetflixDetails {
	cast: string;
	creator: string;
	trailerId: string | null;
	showTrailer: boolean;
	seasons: INetflixSeason[];
	isLoading: boolean;
}
