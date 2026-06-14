import { photosDb, PhotosDBKey } from '$lib/framework/db';

import { PhotosApiClient } from '$lib/framework/api/services/PhotosApiClient';
import { SyncState } from '$lib/os/state/SyncState.svelte';
import type { IPhotoItem } from '$lib/framework/types';

export class PhotosAppState extends SyncState<IPhotoItem[]> {
	appName = 'Photos';
	selectedPhoto: IPhotoItem | null = $state(null);
	tab: 'library' | 'foryou' | 'albums' | 'search' = $state('library');

	constructor() {
		super(photosDb, PhotosDBKey.PHOTOS, [], async () => {
			const data = await PhotosApiClient.getList();
			return data ? data.photos : [];
		});
	}

	async fetchPhotos() {
		await this.load();
	}

	get photos() {
		return this.data || [];
	}

	selectPhoto(photo: IPhotoItem) {
		this.selectedPhoto = photo;
	}

	closePhoto() {
		this.selectedPhoto = null;
	}

	setTab(t: 'library' | 'foryou' | 'albums' | 'search') {
		this.tab = t;
	}
}
