import { db } from '$lib/config/turso';
import { apiHandler } from '$lib/server/api';

export function GET() {
    return apiHandler(async () => {
        const result = await db.execute({
            sql: 'SELECT id, username, name FROM users',
            args: []
        });

        return { users: result.rows };
    });
}
