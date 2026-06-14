import { ApiEndpoints } from '$lib/config/api/endpoints';

export class SystemApiClient {
    static sendKeepalivePing(): void {
        fetch(ApiEndpoints.SYSTEM_KEEPALIVE).catch(() => { });
    }
}
