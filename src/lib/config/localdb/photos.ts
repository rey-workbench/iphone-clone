import { LocalDBAdapter } from './core';
export const photosDb = new LocalDBAdapter('myphone_photos_db', 'photos');

export const PhotosDBKey = {
  PHOTOS: 'photos',
} as const;
