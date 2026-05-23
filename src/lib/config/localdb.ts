import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { openDB } from 'idb';

const DB_NAME = 'reynisa_local_db';
const STORE_NAME = 'sqlite_store';
const FILE_KEY = 'local.sqlite';

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
    db!.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  }
  
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
