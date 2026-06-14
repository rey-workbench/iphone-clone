import { ApiEndpoints } from '$lib/framework/api/config/endpoints';

export class SystemApiClient {
	static sendKeepalivePing(): void {
		fetch(ApiEndpoints.SYSTEM_KEEPALIVE).catch(() => {});
	}
}
