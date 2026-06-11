import { createClient } from '@libsql/client';
import { DATABASE_URL, DATABASE_TOKEN } from '$env/static/private';

if (!DATABASE_URL || !DATABASE_TOKEN) {
  throw new Error('DATABASE_URL and DATABASE_TOKEN must be set in .env');
}

export const db = createClient({
  url: DATABASE_URL,
  authToken: DATABASE_TOKEN
});

export async function setupDatabase() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      date TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_devices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      device_id TEXT NOT NULL,
      device_name TEXT NOT NULL,
      last_active TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    INSERT OR IGNORE INTO users (id, username, password, name) VALUES 
    ('e1b74c2e-4b6c-48c9-8d76-15b561c8f1ea', 'nisa', 'nisa', 'Annisaa Putri Purnomo'),
    ('f2a5b1c3-2d5f-4a8b-9e4c-34f781d9d1bc', 'rey', 'rey', 'Reynald Silva Baktiar'),
    ('034a2253-5118-4d14-a0a0-dc0a2bc04d2b', 'yus', 'yus', 'Yusriyah Firjatullah'),
    ('b2f153a7-8975-4c00-bc10-18e3a2b5e0c5', 'arya', 'arya', ' Arya Bagus');
    
    UPDATE users SET name = 'Annisaa Putri Purnomo' WHERE username = 'nisa';
    UPDATE users SET name = 'Reynald Silva Baktiar' WHERE username = 'rey';
    UPDATE users SET name = 'Yusriyah Firjatullah' WHERE username = 'yus';
    UPDATE users SET name = 'Arya Bagus' WHERE username = 'arya';
  `);
}
