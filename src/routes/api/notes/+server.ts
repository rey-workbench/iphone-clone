import { json } from '@sveltejs/kit';
import { db, setupDatabase } from '$lib/config/turso';
import { apiHandler } from '$lib/server/api';

export function GET() {
  return apiHandler(async () => {
    await setupDatabase();
    const result = await db.execute('SELECT * FROM notes ORDER BY date DESC');
    return { notes: result.rows };
  });
}

export function POST({ request }) {
  return apiHandler(async () => {
    const { id, title, content, date } = await request.json();
    await setupDatabase();
    
    await db.execute({
      sql: `INSERT INTO notes (id, title, content, date) 
            VALUES (?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET 
            title=excluded.title, content=excluded.content, date=excluded.date`,
      args: [id, title, content, date]
    });
    
    return {};
  });
}

export function DELETE({ request }) {
  return apiHandler(async () => {
    const { id } = await request.json();
    await db.execute({
      sql: 'DELETE FROM notes WHERE id = ?',
      args: [id]
    });
    return {};
  });
}
