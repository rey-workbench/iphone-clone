import { DevicesRepository } from '../repositories/DevicesRepository';

export class DevicesService {
	private repository: DevicesRepository;

	constructor() {
		this.repository = new DevicesRepository();
	}

	async getActiveDevices(userId: string | null) {
		if (!userId) {
			throw new Error('User ID is required');
		}
		return await this.repository.findByUserId(userId);
	}

	async revokeDevice(userId: string | undefined, deviceId: string | undefined) {
		if (!userId || !deviceId) {
			throw new Error('User ID and Device ID are required');
		}
		await this.repository.delete(userId, deviceId);
	}
}
