import { db, setupDatabase } from '$lib/config/turso';
import { ApiError } from '$lib/server/api';
import DeviceDetector from 'node-device-detector';

const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
});

export class AuthService {
  async login(body: any, userAgent: string | null) {
    await setupDatabase();

    const { username, password, deviceId } = body;
    
    let deviceName = body.deviceName || 'Unknown Device';
    
    if (userAgent) {
        const parsed = detector.detect(userAgent);
        const os = parsed.os.name ? parsed.os.name : 'Unknown OS';
        const browser = parsed.client.name ? parsed.client.name : 'Unknown Browser';
        const device = parsed.device.brand ? `${parsed.device.brand} ${parsed.device.model}` : '';
        
        deviceName = device ? `${device} - ${browser}` : `${os} - ${browser}`;
    }

    if (!username || !password) {
        throw new ApiError(400, 'Username and password required');
    }

    const result = await db.execute({
        sql: 'SELECT id, username, name FROM users WHERE username = ? AND password = ?',
        args: [username, password]
    });

    if (result.rows.length > 0) {
        const user = result.rows[0];

        if (deviceId && deviceName) {
            const now = new Date().toISOString();
            
            // Remove old entry for this device if exists
            await db.execute({
                sql: 'DELETE FROM user_devices WHERE user_id = ? AND device_id = ?',
                args: [user.id, deviceId]
            });
            
            // Insert new session
            await db.execute({
                sql: `INSERT INTO user_devices (id, user_id, device_id, device_name, last_active, created_at)
                      VALUES (?, ?, ?, ?, ?, ?)`,
                args: [crypto.randomUUID(), user.id, deviceId, deviceName, now, now]
            });
        }

        return { user };
    } else {
        throw new ApiError(401, 'Invalid credentials');
    }
  }
}
