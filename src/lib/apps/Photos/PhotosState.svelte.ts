import { photosDb, PhotosDBKey } from '$lib/config/localdb';
import { ApiConfig } from '$lib/config/api';
import { SyncState } from '$lib/utils/SyncState.svelte';

export class AppPhotosState extends SyncState<any[]> {
  selectedPhoto: any | null = $state(null);
  tab: 'library' | 'foryou' | 'albums' | 'search' = $state('library');

  constructor() {
    super(photosDb, PhotosDBKey.PHOTOS, [], async () => {
      const data = await ApiConfig.fetchPhotosList();
      return data ? data.photos : [];
    });
  }

  async fetchPhotos() {
    await this.load();
  }

  get photos() {
    return this.data || [];
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
