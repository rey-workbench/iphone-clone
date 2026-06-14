import { setupDatabase } from '$lib/backend/config/turso';
import { ApiError } from '$lib/backend/api';
import DeviceDetector from 'node-device-detector';
import { AuthRepository } from '../repositories/AuthRepository';
import { DevicesRepository } from '../repositories/DevicesRepository';

const detector = new DeviceDetector({
	clientIndexes: true,
	deviceIndexes: true,
	deviceAliasCode: false
});

export class AuthService {
	private repository: AuthRepository;
	private devicesRepository: DevicesRepository;

	constructor() {
		this.repository = new AuthRepository();
		this.devicesRepository = new DevicesRepository();
	}

	async login(body: any, userAgent: string | null) {
		await setupDatabase();

		const { username, password, deviceId } = body;

		let deviceName = body.deviceName || 'Unknown Device';

		if (userAgent) {
			const parsed = detector.detect(userAgent);
			const os = parsed.os.name ? parsed.os.name : 'Unknown OS';
			const browser = parsed.client.name ? parsed.client.name : 'Unknown Browser';
			const device = parsed.device.brand ? `${parsed.device.brand} ${parsed.device.model}` : '';

			deviceName = device ? `${device} - ${browser}` : `${os} - ${browser}`;
		}

		if (!username || !password) {
			throw new ApiError(400, 'Username and password required');
		}

		const user = await this.repository.findByCredentials(username, password);

		if (user) {
			if (deviceId && deviceName) {
				const now = new Date().toISOString();

				// Remove old entry for this device if exists
				await this.devicesRepository.delete(user.id, deviceId);

				// Insert new session
				await this.devicesRepository.insert(user.id, deviceId, deviceName, now);
			}

			return { user };
		} else {
			throw new ApiError(401, 'Invalid credentials');
		}
	}
}
