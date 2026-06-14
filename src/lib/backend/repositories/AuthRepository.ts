import { db } from '$lib/backend/config/turso';
import type { IUser } from '$lib/framework/types';

export class AuthRepository {
	async findByCredentials(username: string, password: string): Promise<IUser | null> {
		const result = await db.execute({
			sql: 'SELECT id, username, name FROM users WHERE username = ? AND password = ?',
			args: [username, password]
		});

		if (result.rows.length > 0) {
			return result.rows[0] as unknown as IUser;
		}
		return null;
	}
}
