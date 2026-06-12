import { db } from '$lib/config/turso';
import type { User } from '../models/User';

export class UsersRepository {
  async findAll(): Promise<User[]> {
    const result = await db.execute({
      sql: 'SELECT id, username, name FROM users',
      args: []
    });
    return result.rows as unknown as User[];
  }
}
