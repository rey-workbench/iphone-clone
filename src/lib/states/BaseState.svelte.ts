import { getSetting, setSetting } from '$lib/config/localdb';

export abstract class BaseState<T> {
    protected storageKey: string;
    
    isLoading = $state(false);
    error = $state<string | null>(null);

    constructor(storageKey?: string) {
        this.storageKey = storageKey || '';
    }

    async loadFromDb(defaultData: T): Promise<T> {
        if (!this.storageKey || typeof window === 'undefined') return defaultData;
        this.isLoading = true;
        try {
            const data = await getSetting(this.storageKey, defaultData);
            return data as T;
        } catch (e: any) {
            this.error = e.message || 'Error loading state';
            return defaultData;
        } finally {
            this.isLoading = false;
        }
    }

    saveToDb(data: T) {
        if (!this.storageKey || typeof window === 'undefined') return;
        setSetting(this.storageKey, data);
    }
}
