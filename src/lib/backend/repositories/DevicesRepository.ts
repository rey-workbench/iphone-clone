import { db, setupDatabase } from '$lib/backend/config/turso';
import type { IDevice } from '$lib/framework/types';

export class DevicesRepository {
	async ensureMigration() {
		await setupDatabase();
	}

	async findByUserId(userId: string): Promise<IDevice[]> {
		await this.ensureMigration();
		const result = await db.execute({
			sql: 'SELECT id, device_id, device_name, last_active, created_at FROM user_devices WHERE user_id = ? ORDER BY last_active DESC',
			args: [userId]
		});
		return result.rows as unknown as IDevice[];
	}

	async delete(userId: string, deviceId: string): Promise<void> {
		await this.ensureMigration();
		await db.execute({
			sql: 'DELETE FROM user_devices WHERE user_id = ? AND device_id = ?',
			args: [userId, deviceId]
		});
	}

	async insert(userId: string, deviceId: string, deviceName: string, now: string): Promise<void> {
		await this.ensureMigration();
		await db.execute({
			sql: `INSERT INTO user_devices (id, user_id, device_id, device_name, last_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
			args: [crypto.randomUUID(), userId, deviceId, deviceName, now, now]
		});
	}
}
