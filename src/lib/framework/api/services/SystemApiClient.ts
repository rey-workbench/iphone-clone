import { apiFetch } from '$lib/framework/api/api';
import { ApiEndpoints } from '$lib/framework/api/config/endpoints';

export class SystemApiClient {
	static sendKeepalivePing(): void {
		apiFetch(ApiEndpoints.SYSTEM_KEEPALIVE).catch(() => {});
	}
}
