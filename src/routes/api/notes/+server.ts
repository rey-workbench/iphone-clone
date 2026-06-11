import { json } from '@sveltejs/kit';
import { db, setupDatabase } from '$lib/config/turso';
import { apiHandler } from '$lib/server/api';

async function runMigration() {
  try {
    await db.execute("ALTER TABLE notes ADD COLUMN user_id TEXT DEFAULT ''");
  } catch(e) {
    // ignore
  }
}

export function GET({ url }) {
  return apiHandler(async () => {
    await setupDatabase();
    await runMigration();
    
    const userId = url.searchParams.get('userId');
    if (!userId) return { notes: [] };

    const result = await db.execute({
      sql: 'SELECT * FROM notes WHERE user_id = ? ORDER BY date DESC',
      args: [userId]
    });
    return { notes: result.rows };
  });
}

export function POST({ request }) {
  return apiHandler(async () => {
    const { id, title, content, date, user_id } = await request.json();
    await setupDatabase();
    await runMigration();
    
    if (!user_id) throw new Error("user_id is required");

    await db.execute({
      sql: `INSERT INTO notes (id, user_id, title, content, date) 
            VALUES (?, ?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET 
            title=excluded.title, content=excluded.content, date=excluded.date`,
      args: [id, user_id, title, content, date]
    });
    
    return {};
  });
}

export function DELETE({ request }) {
  return apiHandler(async () => {
    const { id, user_id } = await request.json();
    if (!user_id) throw new Error("user_id is required");
    await db.execute({
      sql: 'DELETE FROM notes WHERE id = ? AND user_id = ?',
      args: [id, user_id]
    });
    return {};
  });
}
