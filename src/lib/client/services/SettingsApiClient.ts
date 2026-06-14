import type { ILinkedDevice } from '$lib/types';
import { ApiConfig } from "$lib/config/api";

export class SettingsApiClient {
    static async getDevices(userId: string): Promise<{ devices: ILinkedDevice[] }> {
        const res = await fetch(`${ApiConfig.AUTH_DEVICES}?userId=${userId}`);
        return await res.json();
    }

    static async revokeDevice(userId: string, deviceId: string): Promise<{ res: Response; result: unknown }> {
        const res = await fetch(ApiConfig.AUTH_DEVICES, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, deviceId })
        });
        return { res, result: res.ok ? await res.json() : null };
    }
}
