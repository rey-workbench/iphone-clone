import { getSetting, setSetting } from '$lib/config/localdb';

/**
 * Base class Svelte 5 untuk manajemen state reaktif.
 * Fitur:
 * 1. SWR (Stale-While-Revalidate) Otomatis: Load dari IndexedDB secara instan (0ms),
 *    lalu fetch dari API di background.
 * 2. Optimistic UI: Menerapkan mutasi ke layar dan cache langsung, 
 *    lalu otomatis me-revert jika API mengembalikan error.
 */
export class SyncState<T> {
    data = $state<T | null>(null);
    loading = $state(true);
    error = $state<string | null>(null);

    protected key: string;
    protected fetcher: () => Promise<T>;
    protected isLoaded = false;

    constructor(key: string, defaultData: T, fetcher: () => Promise<T>) {
        this.key = key;
        this.data = defaultData;
        this.fetcher = fetcher;
    }

    /**
     * Memanggil ini untuk memulai SWR (biasanya dipanggil di dalam fungsi load() / init()).
     */
    async load() {
        if (typeof window === 'undefined' || this.isLoaded) return;
        this.isLoaded = true;
        this.loading = true;
        this.error = null;

        // 1. STALE: Load dari LocalDB (0ms)
        const cached = await getSetting(this.key, null);
        if (cached !== null) {
            this.data = this.parseCache(cached);
            this.loading = false;
        }

        // 2. REVALIDATE: Ambil dari Server
        try {
            const fresh = await this.fetcher();
            this.data = fresh;
            // 3. CACHE: Update IndexedDB
            await this.saveCache();
        } catch (e: any) {
            console.error(`[SyncState] Failed to fetch data for ${this.key}:`, e);
            this.error = e.message || String(e);
        } finally {
            this.loading = false;
        }
    }

    /**
     * Mutasi Optimistic UI yang otomatis di-revert jika API error.
     * @param optimisticUpdate Fungsi untuk memodifikasi this.data
     * @param remoteMutation Fungsi async untuk melakukan request ke API (POST/PUT/DELETE)
     */
    async mutate(
        optimisticUpdate: (current: T) => T,
        remoteMutation: () => Promise<void>
    ) {
        // Backup original state
        // Karena this.data di Svelte 5 adalah proxy, kita clone dengan $state.snapshot jika ada
        const original = JSON.parse(JSON.stringify(this.data));

        try {
            // 1. Optimistic Update
            this.data = optimisticUpdate(this.data as T);
            await this.saveCache();

            // 2. Remote Action
            await remoteMutation();

        } catch (e: any) {
            console.error(`[SyncState] Optimistic Mutation failed for ${this.key}, reverting...`, e);
            this.error = e.message || String(e);
            
            // 3. Revert
            this.data = this.parseCache(original);
            await this.saveCache();
            throw e;
        }
    }

    /**
     * Simpan state reaktif saat ini ke IndexedDB dengan aman (membuang Proxy Svelte 5).
     */
    protected async saveCache() {
        await setSetting(this.key, this.data);
    }

    /**
     * Hook virtual: Override fungsi ini di class turunan jika butuh mengubah data mentah dari JSON 
     * (misalnya mengubah string menjadi objek Date).
     */
    protected parseCache(cachedData: any): T {
        return cachedData as T;
    }
}
