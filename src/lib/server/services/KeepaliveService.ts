import { KeepaliveRepository } from '../repositories/KeepaliveRepository';

export class KeepaliveService {
	private repository: KeepaliveRepository;

	constructor() {
		this.repository = new KeepaliveRepository();
	}

	async ping() {
		await this.repository.ping();
		return { timestamp: new Date().toISOString(), status: 'Database is alive & cleaned' };
	}
}
