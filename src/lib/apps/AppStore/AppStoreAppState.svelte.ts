import { Smartphone } from '@lucide/svelte';
import { appstoreDb, AppStoreDBKey } from '$lib/config/localdb';
import { SyncState } from '$lib/utils/SyncState.svelte';
import { ApiConfig } from '$lib/config/api';
import type { TAppStoreTabId } from '$lib/types';

export class AppStoreAppState extends SyncState<any> {
    tab = $state<TAppStoreTabId>('today');
    featured: any[] = $state([]);
    topApps: any[] = $state([]);

    constructor() {
        super(appstoreDb, AppStoreDBKey.APPSTORE_PRODUCTS, null, async () => {
            const { AppStoreApiClient } = await import('$lib/client/services/AppStoreApiClient');
            const data = await AppStoreApiClient.getProducts();
            return data;
        });
    }

    async init() {
        await this.load();
    }

    // Override internal parseCache or use a dedicated method to process data when loaded
    protected parseCache(cached: any) {
        if (cached) {
            this.applyData(cached);
        }
        return cached;
    }

    private applyData(data: any) {
        if (!data || !data.products) return;
        const products = data.products;
        this.featured = products.slice(0, 3).map((p: any) => ({
            name: p.title,
            dev: p.brand || 'Indie Dev',
            img: p.thumbnail,
            cat: p.category.replace('-', ' ').toUpperCase()
        }));
        this.topApps = products.slice(3).map((p: any, i: number) => ({
            name: p.title,
            dev: p.brand || 'Studio',
            icon: Smartphone,
            cat: p.category.replace('-', ' '),
            rank: i + 1,
            img: p.images[0] || p.thumbnail
        }));
    }
}
