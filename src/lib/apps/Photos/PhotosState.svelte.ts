import { photosDb, PhotosDBKey } from '$lib/config/localdb';
import { ApiConfig } from '$lib/config/api';

export class AppPhotosState {
  selectedPhoto: any | null = $state(null);
  tab: 'library' | 'foryou' | 'albums' | 'search' = $state('library');
  photos: any[] = $state([]);
  loading = $state(true);

  constructor() {}

  async fetchPhotos() {
    this.loading = true;
    try {
      // 1. Load dari LocalDB dulu (instan)
      const cached = await photosDb.get(PhotosDBKey.PHOTOS, null);
      if (cached) {
        this.photos = cached;
        this.loading = false;
      }

      // 2. Fetch terbaru di background
      const data = await ApiConfig.fetchPhotosList();
      if (data) {
        await photosDb.set(PhotosDBKey.PHOTOS, data.photos);
        this.photos = data;
      }
    } catch(e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  selectPhoto(photo: any) {
    this.selectedPhoto = photo;
  }

  closePhoto() {
    this.selectedPhoto = null;
  }

  setTab(t: 'library' | 'foryou' | 'albums' | 'search') {
    this.tab = t;
  }
}
