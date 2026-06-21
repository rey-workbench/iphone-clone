import { apiHandler, ApiError } from '$lib/backend/api';
import { DevicesService } from '$lib/backend/services/DevicesService';
import { isAuthorized } from '$lib/backend/security/AuthValidator';
import { RevokeDeviceSchema } from '$lib/backend/validation/Validation';

const devicesService = new DevicesService();

// GET: Fetch all active devices for a user
export function GET({ url, request }) {
	return apiHandler(async () => {
		const userId = url.searchParams.get('userId');
        if (!userId) throw new ApiError(400, 'User ID is required');

        if (!(await isAuthorized(request, userId))) {
            throw new ApiError(403, 'Unauthorized access to user devices');
        }

		try {
			const devices = await devicesService.getActiveDevices(userId);
			return { devices };
		} catch (e: any) {
			throw new ApiError(400, e.message);
		}
	});
}

// DELETE: Revoke a specific device
export function DELETE({ request }) {
	return apiHandler(async () => {
		const body = await request.json();
        const data = RevokeDeviceSchema.parse(body);

        if (!(await isAuthorized(request, data.userId))) {
            throw new ApiError(403, 'Unauthorized to revoke devices for this user');
        }

		try {
			await devicesService.revokeDevice(data.userId, data.deviceId);
			return { success: true };
		} catch (e: any) {
			throw new ApiError(400, e.message);
		}
	});
}
