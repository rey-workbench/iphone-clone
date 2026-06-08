import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'reynisa_local_db_v2';
const DB_VERSION = 2;

/** Kunci standar untuk seluruh penyimpanan di LocalDB */
export const LocalDBKey = {
  // Auth & User
  CURRENT_USER:   'current_user',
  USERS_LIST:     'users_list',
  USERS:          'users',
  // App: Notes
  NOTES:          'notes',
  AI_MESSAGES:    (userId: string) => `ai_messages_${userId}`,
  // App: Mail
  MAIL_INBOX:     'mail_inbox',
  // App: Photos
  PHOTOS:         'photos',
  // App: AppStore
  APPSTORE_PRODUCTS: 'appstore_products',
  APP_STORE:      'app_store',
  // App: Settings
  SETTINGS:       'settings',
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

export async function initLocalDB() {
  if (typeof window === 'undefined') return null; // Avoid running on SSR
  
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('call_history')) {
          const callStore = db.createObjectStore('call_history', { keyPath: 'id' });
          callStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      }
    });
  }
  return dbPromise;
}

export async function saveLocalDB() {
  // No-op: idb otomatis menyimpan ke disk, tidak perlu export manual seperti sql.js
}

export async function setSetting(key: string, val: any) {
  const db = await initLocalDB();
  if (!db) return;
  // Svelte 5 $state Proxies cannot be cloned by IndexedDB's structured clone.
  // We strip them by serializing to JSON first.
  const rawVal = JSON.parse(JSON.stringify(val));
  await db.put('settings', rawVal, key);
}

export async function getSetting(key: string, defaultValue: any) {
  const db = await initLocalDB();
  if (!db) return defaultValue;
  const val = await db.get('settings', key);
  return val !== undefined ? val : defaultValue;
}
