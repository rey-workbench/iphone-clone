import { openDB, type IDBPDatabase } from 'idb';

export class LocalDBAdapter {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  constructor(public dbName: string, public storeName: string = 'data', public version: number = 1) { }

  async init() {
    if (typeof window === 'undefined') return null; // Avoid running on SSR

    if (!this.dbPromise) {
      this.dbPromise = openDB(this.dbName, this.version, {
        upgrade: (db) => {
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        },
      });
    }
    return this.dbPromise;
  }

  async set(key: string, val: any) {
    const db = await this.init();
    if (!db) return;

    if (val === undefined || val === null) {
      await db.delete(this.storeName, key);
      return;
    }
    const rawVal = JSON.parse(JSON.stringify(val));
    await db.put(this.storeName, rawVal, key);
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    const db = await this.init();
    if (!db) return defaultValue;

    const val = await db.get(this.storeName, key);
    return val !== undefined ? val : defaultValue;
  }
}
