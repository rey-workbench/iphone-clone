import type { LocalDBAdapter } from '$lib/config/localdb/core';

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

    protected db: LocalDBAdapter<T>;
    protected key: string;
    protected fetcher: () => Promise<T>;
    protected isLoaded = false;

    constructor(db: LocalDBAdapter<T>, key: string, defaultData: T, fetcher: () => Promise<T>) {
        this.db = db;
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
        const cached = await this.db.get(this.key, null as unknown as T);
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
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            console.error(`[SyncState] Failed to fetch data for ${this.key}:`, e);
            this.error = message;
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
        const original = this.data ? $state.snapshot(this.data) as T : null;

        try {
            // 1. Optimistic Update
            this.data = optimisticUpdate(this.data as T);
            await this.saveCache();

            // 2. Remote Action
            await remoteMutation();

        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            console.error(`[SyncState] Optimistic Mutation failed for ${this.key}, reverting...`, e);
            this.error = message;
            
            // 3. Revert
            this.data = original ? this.parseCache(original) : null;
            await this.saveCache();
            throw e;
        }
    }

    /**
     * Simpan state reaktif saat ini ke IndexedDB dengan aman (membuang Proxy Svelte 5).
     */
    protected async saveCache() {
        // Use $state.snapshot to strip Svelte proxies before storing
        const snapshot = this.data ? $state.snapshot(this.data) : null;
        await this.db.set(this.key, snapshot as T);
    }

    /**
     * Hook virtual: Override fungsi ini di class turunan jika butuh mengubah data mentah dari JSON 
     * (misalnya mengubah string menjadi objek Date).
     */
    protected parseCache(cachedData: T): T {
        return cachedData;
    }
}
