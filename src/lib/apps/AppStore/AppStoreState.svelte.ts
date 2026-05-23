import { Smartphone } from '@lucide/svelte';
import { fetchWithCache } from '$lib/utils/fetchWithCache';
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
            const data = await fetchWithCache(ApiConfig.getAppStoreProducts());
            if (data) {
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
                    icon: Smartphone, // Generic icon for dynamic apps
                    cat: p.category.replace('-', ' '),
                    rank: i + 1,
                    img: p.images[0] || p.thumbnail
                }));
            }
        } catch(e) {
            console.error(e);
        } finally {
            this.loading = false;
        }
    }
}
