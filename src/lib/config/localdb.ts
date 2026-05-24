import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { openDB } from 'idb';

const DB_NAME = 'reynisa_local_db';
const STORE_NAME = 'sqlite_store';
const FILE_KEY = 'local.sqlite';

/** Kunci standar untuk seluruh penyimpanan di LocalDB */
export const LocalDBKey = {
  // Auth & User
  CURRENT_USER:   'current_user',
  USERS:          'users',

  // App: Notes
  AI_MESSAGES:    (userId: string) => `ai_messages_${userId}`,

  // App: Mail
  MAIL:           'mail',

  // App: Photos
  PHOTOS:         'photos',

  // App: AppStore
  APP_STORE:      'app_store',

  // App: Settings
  SETTINGS:       'settings',
} as const;

let SQL: any;
let db: Database | null = null;
let isInitialized = false;

async function getIDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
}

export async function initLocalDB() {
  if (typeof window === 'undefined') return null; // Avoid running on SSR
  if (isInitialized && db) return db;

  // Wait for sql.js to initialize using CDN for the wasm file
  SQL = await initSqlJs({
    locateFile: (file: string) => `https://unpkg.com/sql.js@1.14.1/dist/${file}`
  });

  const idb = await getIDB();
  const savedData = await idb.get(STORE_NAME, FILE_KEY);

  if (savedData && savedData.length > 0) {
    db= new SQL.Database(savedData);
  } else {
    db = new SQL.Database();
  }

  db!.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS call_history (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      is_video INTEGER NOT NULL DEFAULT 0
    );
  `);
  
  isInitialized = true;
  return db;
}

export async function saveLocalDB() {
  if (!db) return;
  const data = db.export();
  const idb = await getIDB();
  await idb.put(STORE_NAME, data, FILE_KEY);
}

export async function setSetting(key: string, value: any) {
  const d = await initLocalDB();
  if (!d) return;
  d.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, JSON.stringify(value)]);
  await saveLocalDB();
}

export async function getSetting(key: string, defaultValue: any) {
  const d = await initLocalDB();
  if (!d) return defaultValue;
  const res = d.exec('SELECT value FROM settings WHERE key = ?', [key]);
  if (res.length > 0 && res[0].values.length > 0) {
    return JSON.parse(res[0].values[0][0] as string);
  }
  return defaultValue;
}

export type CallHistoryEntry = {
  id: string;
  contact_id: string;
  contact_name: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  duration: number;
  is_video: boolean;
};

export async function saveCallHistory(entry: CallHistoryEntry) {
  const d = await initLocalDB();
  if (!d) return;
  d.run(
    'INSERT INTO call_history (id, contact_id, contact_name, type, timestamp, duration, is_video) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [entry.id, entry.contact_id, entry.contact_name, entry.type, entry.timestamp, entry.duration, entry.is_video ? 1 : 0]
  );
  await saveLocalDB();
}

export async function getCallHistory(): Promise<CallHistoryEntry[]> {
  const d = await initLocalDB();
  if (!d) return [];
  const res = d.exec('SELECT id, contact_id, contact_name, type, timestamp, duration, is_video FROM call_history ORDER BY timestamp DESC LIMIT 100');
  if (res.length === 0) return [];
  
  return res[0].values.map((v: any[]) => ({
    id: v[0] as string,
    contact_id: v[1] as string,
    contact_name: v[2] as string,
    type: v[3] as 'incoming' | 'outgoing' | 'missed',
    timestamp: v[4] as number,
    duration: v[5] as number,
    is_video: (v[6] as number) === 1,
  }));
}
