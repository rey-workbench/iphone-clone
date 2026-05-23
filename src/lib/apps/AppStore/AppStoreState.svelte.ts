import { Smartphone } from '@lucide/svelte';
import { getSetting, setSetting, LocalDBKey } from '$lib/config/localdb';
import { ApiConfig } from '$lib/config/api';
import type { AppStoreTabId } from '$lib/types';

export class AppStoreState {
    tab = $state<AppStoreTabId>('today');
    featured: any[] = $state([]);
    topApps: any[] = $state([]);
    loading = $state(true);

    constructor() {}

    async init() {
        this.loading = true;
        try {
            // 1. Tampilkan cache LocalDB dulu (instan)
            const cached = await getSetting(LocalDBKey.APP_STORE, null);
            if (cached) {
                this.applyData(cached);
                this.loading = false;
            }

            // 2. Fetch terbaru di background
            const data = await ApiConfig.fetchAppStoreProducts();
            if (data) {
                await setSetting(LocalDBKey.APP_STORE, data);
                this.applyData(data);
            }
        } catch(e) {
            console.error(e);
        } finally {
            this.loading = false;
        }
    }

    applyData(data: any) {
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
