import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'myphone_local_db';
const DB_VERSION = 1;
const STORES = [
	'appstore',
	'mail',
	'notes',
	'call_history',
	'photos',
	'session',
	'settings',
	'users'
] as const;

type StoreName = (typeof STORES)[number];

let globalDbPromise: Promise<IDBPDatabase> | null = null;

function getGlobalDB(): Promise<IDBPDatabase> | null {
	if (typeof window === 'undefined') return null;
	if (!globalDbPromise) {
		globalDbPromise = openDB(DB_NAME, DB_VERSION, {
			upgrade: (db) => {
				for (const store of STORES) {
					if (!db.objectStoreNames.contains(store)) {
						db.createObjectStore(store);
					}
				}
			}
		}).catch((err) => {
			// console.error('[LocalDB] Failed to open database:', err);
			globalDbPromise = null;
			throw err;
		});
	}
	return globalDbPromise;
}

export class LocalDBAdapter<T = any> {
	readonly storeName: StoreName;

	constructor(storeName: StoreName) {
		if (!STORES.includes(storeName)) {
			throw new Error(
				`[LocalDB] Invalid store name: ${storeName}. Valid stores: ${STORES.join(', ')}`
			);
		}
		this.storeName = storeName;
	}

	private async getDB(): Promise<IDBPDatabase | null> {
		try {
			return await getGlobalDB();
		} catch {
			return null;
		}
	}

	async set(key: string, value: T): Promise<void> {
		const db = await this.getDB();
		if (!db) return;

		try {
			if (value === undefined || value === null) {
				await db.delete(this.storeName, key);
				return;
			}
			await db.put(this.storeName, value, key);
		} catch {
			// console.error(`[LocalDB] Failed to set ${this.storeName}/${key}:`, err);
		}
	}

	async get(key: string, defaultValue: T): Promise<T> {
		const db = await this.getDB();
		if (!db) return defaultValue;

		try {
			const value = await db.get(this.storeName, key);
			return value !== undefined ? value : defaultValue;
		} catch {
			// console.error(`[LocalDB] Failed to get ${this.storeName}/${key}:`, err);
			return defaultValue;
		}
	}

	async getAll(): Promise<T[]> {
		const db = await this.getDB();
		if (!db) return [];

		try {
			return await db.getAll(this.storeName);
		} catch {
			// console.error(`[LocalDB] Failed to getAll from ${this.storeName}:`, err);
			return [];
		}
	}

	async delete(key: string): Promise<void> {
		const db = await this.getDB();
		if (!db) return;

		try {
			await db.delete(this.storeName, key);
		} catch {
			// console.error(`[LocalDB] Failed to delete ${this.storeName}/${key}:`, err);
		}
	}

	async has(key: string): Promise<boolean> {
		const db = await this.getDB();
		if (!db) return false;

		try {
			const value = await db.get(this.storeName, key);
			return value !== undefined;
		} catch {
			// console.error(`[LocalDB] Failed to check ${this.storeName}/${key}:`, err);
			return false;
		}
	}

	async keys(): Promise<string[]> {
		const db = await this.getDB();
		if (!db) return [];

		try {
			return (await db.getAllKeys(this.storeName)) as string[];
		} catch {
			// console.error(`[LocalDB] Failed to get keys from ${this.storeName}:`, err);
			return [];
		}
	}

	async clear(): Promise<void> {
		const db = await this.getDB();
		if (!db) return;

		try {
			await db.clear(this.storeName);
		} catch {
			// console.error(`[LocalDB] Failed to clear ${this.storeName}:`, err);
		}
	}

	async count(): Promise<number> {
		const db = await this.getDB();
		if (!db) return 0;

		try {
			return await db.count(this.storeName);
		} catch {
			// console.error(`[LocalDB] Failed to count ${this.storeName}:`, err);
			return 0;
		}
	}
}
