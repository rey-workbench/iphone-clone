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
    INSERT OR IGNORE INTO users (id, username, password, name) VALUES 
    ('user1', 'user1', '12345', 'John Doe (User 1)'),
    ('user2', 'user2', '12345', 'Jane Smith (User 2)');
  `);
}
