import { Smartphone } from '@lucide/svelte';

export type TabId = 'today' | 'games' | 'apps' | 'search';

export class AppStoreState {
    tab = $state<TabId>('today');
    featured: any[] = $state([]);
    topApps: any[] = $state([]);
    loading = $state(true);

    constructor() {}

    async init() {
        this.loading = true;
        try {
            const res = await fetch('https://dummyjson.com/products?limit=11&skip=10');
            if (res.ok) {
                const data = await res.json();
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
