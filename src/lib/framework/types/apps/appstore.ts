export type TAppStoreTabId = 'today' | 'games' | 'apps' | 'search';

export interface IAppStoreProduct {
	id?: string;
	name: string;
	dev: string;
	img?: string;
	icon?: any;
	cat?: string;
	rank?: number;
}

export interface IAppStoreData {
	products: {
		title: string;
		brand?: string;
		thumbnail?: string;
		category: string;
		images?: string[];
	}[];
}
