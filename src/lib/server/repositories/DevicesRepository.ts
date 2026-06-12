import { db, setupDatabase } from '$lib/config/turso';
import type { Device } from '../models/Device';

export class DevicesRepository {
  async ensureMigration() {
    await setupDatabase();
  }

  async findByUserId(userId: string): Promise<Device[]> {
    await this.ensureMigration();
    const result = await db.execute({
      sql: 'SELECT id, device_id, device_name, last_active, created_at FROM user_devices WHERE user_id = ? ORDER BY last_active DESC',
      args: [userId]
    });
    return result.rows as unknown as Device[];
  }

  async delete(userId: string, deviceId: string): Promise<void> {
    await this.ensureMigration();
    await db.execute({
      sql: 'DELETE FROM user_devices WHERE user_id = ? AND device_id = ?',
      args: [userId, deviceId]
    });
  }
}
