import { json } from '@sveltejs/kit';
import { db, setupDatabase } from '$lib/server/db';

export async function POST({ request }) {
    try {
        // Ensure database is setup
        await setupDatabase();

        const { username, password } = await request.json();

        if (!username || !password) {
            return json({ success: false, error: 'Username and password required' }, { status: 400 });
        }

        const result = await db.execute({
            sql: 'SELECT id, username, name FROM users WHERE username = ? AND password = ?',
            args: [username, password]
        });

        if (result.rows.length > 0) {
            const user = result.rows[0];
            return json({ success: true, user });
        } else {
            return json({ success: false, error: 'Invalid credentials' }, { status: 401 });
        }

    } catch (e: any) {
        return json({ success: false, error: e.message }, { status: 500 });
    }
}
