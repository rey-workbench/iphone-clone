import type { LocalDBAdapter } from '$lib/config/localdb/core';
import { BaseGlobalState } from '../os/states/baseGlobalState.svelte';

/**
 * Base class Svelte 5 untuk manajemen state lokal (tanpa API).
 * Menangani boilerplate `typeof window` dan `$state.snapshot` secara otomatis.
 */
export class PersistedState<T> extends BaseGlobalState {
    data = $state<T | null>(null);

    protected db: LocalDBAdapter<T>;
    protected key: string;
    private isInitialized = false;

    constructor(db: LocalDBAdapter<T>, key: string, defaultData: T) {
        super();
        this.db = db;
        this.key = key;
        this.data = defaultData;

        if (typeof window !== 'undefined') {
            this.init();
        }
    }

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        this.setLoading(true);

        try {
            const cached = await this.db.get(this.key, null as unknown as T);
            if (cached !== null) {
                // Gunakan spread/assign jika T berupa object kompleks, atau set langsung jika array/primitive
                // Disini kita biarkan implementasi parse/hydrate spesifik dioverride oleh child jika diperlukan.
                this.data = this.parseCache(cached);
            } else {
                // If nothing in DB, save the default Data
                await this.save();
            }
        } catch (e) {
            // console.error(`Failed to load PersistedState for ${this.key}`, e);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Menyimpan snapshot dari `this.data` ke IndexedDB secara otomatis.
     * Panggil fungsi ini setiap kali ada perubahan data yang perlu disimpan.
     */
    async save() {
        if (typeof window === 'undefined') return;
        try {
            const snapshot = this.data ? $state.snapshot(this.data) : null;
            await this.db.set(this.key, snapshot as T);
        } catch (e) {
            // console.error(`Failed to save PersistedState for ${this.key}`, e);
        }
    }

    /**
     * Override ini jika perlu mengubah format data dari DB (contoh mengubah string tanggal menjadi objek Date).
     */
    protected parseCache(cached: T): T {
        return cached;
    }
}
