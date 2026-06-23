import { DevicesRepository } from '$lib/backend/repositories/DevicesRepository';
import { ApiKeyService } from '$lib/backend/services/ApiKeyService';

const devicesRepo = new DevicesRepository();
const apiKeyService = new ApiKeyService();

export async function isAuthorized(
	request: Request,
	targetUserId: string | null | undefined
): Promise<boolean> {
	// 1. Try API Key authorization first
	let apiKey = request.headers.get('x-api-key');
	if (!apiKey) {
		const authHeader = request.headers.get('authorization') || '';
		if (authHeader.startsWith('Bearer ')) {
			apiKey = authHeader.substring(7);
		}
	}

	if (apiKey) {
		const keyValidation = await apiKeyService.validateKey(apiKey);
		if (keyValidation.valid && keyValidation.userId) {
			if (targetUserId !== undefined && targetUserId !== null) {
				return keyValidation.userId === targetUserId;
			}
			return true;
		}
	}

	// 2. Fall back to standard session (x-user-id + x-device-id)
	const authUserId = request.headers.get('x-user-id');
	const authDeviceId = request.headers.get('x-device-id');

	if (!authUserId || !authDeviceId) return false;

	// If a specific target is provided, ensure it matches the authenticated user
	if (targetUserId !== undefined && targetUserId !== null) {
		if (authUserId !== targetUserId) return false;
	}

	const devices = await devicesRepo.findByUserId(authUserId);
	return devices.some((d) => d.device_id === authDeviceId);
}

export async function getAuthenticatedUser(request: Request): Promise<string | null> {
	let apiKey = request.headers.get('x-api-key');
	if (!apiKey) {
		const authHeader = request.headers.get('authorization') || '';
		if (authHeader.startsWith('Bearer ')) {
			apiKey = authHeader.substring(7);
		}
	}

	if (apiKey) {
		const keyValidation = await apiKeyService.validateKey(apiKey);
		if (keyValidation.valid && keyValidation.userId) {
			return keyValidation.userId;
		}
	}

	const authUserId = request.headers.get('x-user-id');
	const authDeviceId = request.headers.get('x-device-id');

	if (!authUserId || !authDeviceId) return null;

	const devices = await devicesRepo.findByUserId(authUserId);
	if (devices.some((d) => d.device_id === authDeviceId)) {
		return authUserId;
	}
	return null;
}
