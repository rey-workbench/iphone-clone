import { fetchWithCache } from '$lib/utils/fetchWithCache';
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
      const data = await fetchWithCache(ApiConfig.getPhotosList());
      if (data) {
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
