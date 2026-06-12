import { apiHandler, ApiError } from '$lib/server/api';
import { KeepaliveService } from '$lib/server/services/KeepaliveService';

const keepaliveService = new KeepaliveService();

export function GET() {
    return apiHandler(async () => {
        try {
            return await keepaliveService.ping();
        } catch (error: any) {
            console.error('Keepalive error:', error);
            throw new ApiError(500, error.message);
        }
    });
}
