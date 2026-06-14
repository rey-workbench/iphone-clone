import { db } from '$lib/config/turso';
import type { User } from '$lib/models/User';

export class AuthRepository {
  async findByCredentials(username: string, password: string): Promise<User | null> {
    const result = await db.execute({
      sql: 'SELECT id, username, name FROM users WHERE username = ? AND password = ?',
      args: [username, password]
    });

    if (result.rows.length > 0) {
      return result.rows[0] as unknown as User;
    }
    return null;
  }
}
