import { db, setupDatabase } from '$lib/config/turso';
import type { INote } from '$lib/types';

export class NotesRepository {
  async ensureMigration() {
    try {
      await setupDatabase();
      await db.execute("ALTER TABLE notes ADD COLUMN user_id TEXT DEFAULT ''");
    } catch {
      // ignore
    }
  }

  async findByUserId(userId: string): Promise<any[]> {
    await this.ensureMigration();
    const result = await db.execute({
      sql: 'SELECT * FROM notes WHERE user_id = ? ORDER BY date DESC',
      args: [userId]
    });
    return result.rows;
  }

  async upsert(note: INote): Promise<void> {
    await this.ensureMigration();
    await db.execute({
      sql: `INSERT INTO notes (id, user_id, title, content, date) 
            VALUES (?, ?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET 
            title=excluded.title, content=excluded.content, date=excluded.date`,
      args: [note.id, note.user_id, note.title, note.content, (note.date instanceof Date ? note.date.toISOString() : note.date) || new Date().toISOString()] as string[]
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await db.execute({
      sql: 'DELETE FROM notes WHERE id = ? AND user_id = ?',
      args: [id, userId]
    });
  }
}
