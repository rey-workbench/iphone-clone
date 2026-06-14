import { db } from '$lib/config/turso';
import type { IUser } from '$lib/types';

export class UsersRepository {
	async findAll(): Promise<IUser[]> {
		const result = await db.execute({
			sql: 'SELECT id, username, name FROM users',
			args: []
		});
		return result.rows as unknown as IUser[];
	}
}
