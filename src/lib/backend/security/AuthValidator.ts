import { DevicesRepository } from '$lib/backend/repositories/DevicesRepository';

const devicesRepo = new DevicesRepository();

export async function isAuthorized(request: Request, targetUserId: string | null | undefined): Promise<boolean> {
	const authUserId = request.headers.get('x-user-id');
	const authDeviceId = request.headers.get('x-device-id');

	if (!authUserId || !authDeviceId) return false;
	
    // If a specific target is provided, ensure it matches the authenticated user
    if (targetUserId !== undefined && targetUserId !== null) {
        if (authUserId !== targetUserId) return false;
    }

	const devices = await devicesRepo.findByUserId(authUserId);
	return devices.some(d => d.device_id === authDeviceId);
}

export async function getAuthenticatedUser(request: Request): Promise<string | null> {
    const authUserId = request.headers.get('x-user-id');
	const authDeviceId = request.headers.get('x-device-id');

	if (!authUserId || !authDeviceId) return null;

	const devices = await devicesRepo.findByUserId(authUserId);
	if (devices.some(d => d.device_id === authDeviceId)) {
        return authUserId;
    }
    return null;
}
