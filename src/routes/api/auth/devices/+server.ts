import { apiHandler, ApiError } from '$lib/backend/api';
import { DevicesService } from '$lib/backend/services/DevicesService';

const devicesService = new DevicesService();

// GET: Fetch all active devices for a user
export function GET({ url }) {
	return apiHandler(async () => {
		const userId = url.searchParams.get('userId');
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
		const { userId, deviceId } = await request.json();
		try {
			await devicesService.revokeDevice(userId, deviceId);
			return { success: true };
		} catch (e: any) {
			throw new ApiError(400, e.message);
		}
	});
}
