import { db, setupDatabase } from '$lib/config/turso';
import { apiHandler, ApiError } from '$lib/server/api';

export function POST({ request }) {
    return apiHandler(async () => {
        // Ensure database is setup
        await setupDatabase();

        const { username, password } = await request.json();

        if (!username || !password) {
            throw new ApiError(400, 'Username and password required');
        }

        const result = await db.execute({
            sql: 'SELECT id, username, name FROM users WHERE username = ? AND password = ?',
            args: [username, password]
        });

        if (result.rows.length > 0) {
            const user = result.rows[0];
            return { user };
        } else {
            throw new ApiError(401, 'Invalid credentials');
        }
    });
}
