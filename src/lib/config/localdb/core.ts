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
];

let globalDbPromise: Promise<IDBPDatabase> | null = null;

function getGlobalDB(): Promise<IDBPDatabase> | null {
  if (typeof window === 'undefined') return null; // Avoid running on SSR
  if (!globalDbPromise) {
    globalDbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade: (db) => {
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        }
      },
    });
  }
  return globalDbPromise;
}

export class LocalDBAdapter {
  public storeName: string;

  constructor(dbNameOrStoreName: string, storeName?: string) {
    this.storeName = storeName || dbNameOrStoreName;
  }

  async init() {
    return getGlobalDB();
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

  async getAll<T>(): Promise<T[]> {
    const db = await this.init();
    if (!db) return [];
    return db.getAll(this.storeName) as Promise<T[]>;
  }
}
