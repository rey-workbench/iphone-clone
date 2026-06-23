import { apiWrapper, ApiError } from '$lib/backend/api';
import { KeepaliveService } from '$lib/backend/services/KeepaliveService';

const keepaliveService = new KeepaliveService();

export const GET = apiWrapper(
	async () => {
		try {
			return await keepaliveService.ping();
		} catch (error: any) {
			throw new ApiError(500, error.message);
		}
	},
	{ requireAuth: true }
);
