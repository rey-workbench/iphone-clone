import { json } from '@sveltejs/kit';
import { db, setupDatabase } from '$lib/server/db';

export async function GET() {
  try {
    await setupDatabase();
    const result = await db.execute('SELECT * FROM notes ORDER BY date DESC');
    return json({ success: true, notes: result.rows });
  } catch (error) {
    return json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { id, title, content, date } = await request.json();
    await setupDatabase();
    
    await db.execute({
      sql: `INSERT INTO notes (id, title, content, date) 
            VALUES (?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET 
            title=excluded.title, content=excluded.content, date=excluded.date`,
      args: [id, title, content, date]
    });
    
    return json({ success: true });
  } catch (error) {
    return json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE({ request }) {
  try {
    const { id } = await request.json();
    await db.execute({
      sql: 'DELETE FROM notes WHERE id = ?',
      args: [id]
    });
    return json({ success: true });
  } catch (error) {
    return json({ success: false, error: String(error) }, { status: 500 });
  }
}
