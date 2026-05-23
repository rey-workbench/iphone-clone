import { db, setupDatabase } from '$lib/config/turso';
import { apiHandler, ApiError } from '$lib/server/api';

// GET: Fetch all active devices for a user
export function GET({ url }) {
    return apiHandler(async () => {
        await setupDatabase();
        
        const userId = url.searchParams.get('userId');
        if (!userId) {
            throw new ApiError(400, 'User ID is required');
        }

        const result = await db.execute({
            sql: 'SELECT id, device_id, device_name, last_active, created_at FROM user_devices WHERE user_id = ? ORDER BY last_active DESC',
            args: [userId]
        });

        return { devices: result.rows };
    });
}

// DELETE: Revoke a specific device
export function DELETE({ request }) {
    return apiHandler(async () => {
        await setupDatabase();

        const { userId, deviceId } = await request.json();

        if (!userId || !deviceId) {
            throw new ApiError(400, 'User ID and Device ID are required');
        }

        await db.execute({
            sql: 'DELETE FROM user_devices WHERE user_id = ? AND device_id = ?',
            args: [userId, deviceId]
        });

        return { success: true };
    });
}
