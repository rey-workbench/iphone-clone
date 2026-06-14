import { LocalDBAdapter } from './core';
export const photosDb = new LocalDBAdapter('photos');

export const PhotosDBKey = {
	PHOTOS: 'photos'
} as const;
