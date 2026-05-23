import { getSetting, setSetting } from '$lib/config/localdb';

export class UsersState {
    users = $state<any[]>([]);

    async fetchUsers(onUpdate?: (users: any[]) => void) {
        try {
            // 1. Coba load dari LocalDB terlebih dahulu (Instan)
            const cachedUsers = await getSetting('cached_turso_users', []);
            if (cachedUsers && cachedUsers.length > 0) {
                this.users = cachedUsers;
                if (onUpdate) onUpdate(this.users);
            }

            // 2. Fetch data terbaru dari server (Turso) di background
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                if (data.users) {
                    this.users = data.users;
                    // 3. Simpan ke LocalDB untuk load berikutnya
                    await setSetting('cached_turso_users', data.users);
                    
                    if (onUpdate) onUpdate(this.users);
                }
            }
        } catch (e) {
            console.error("Failed to fetch users:", e);
        }
    }
}

export const usersState = new UsersState();
