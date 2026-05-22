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
  await db.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `);
}
