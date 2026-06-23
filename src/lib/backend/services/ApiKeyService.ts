import { createHash, randomBytes } from 'crypto';
import { db, setupDatabase } from '$lib/backend/config/turso';

export interface IApiKeyMetadata {
	key_hash: string;
	key_id: string;
	user_id: string;
	scopes: string[];
	is_active: boolean;
	expires_at: string | null;
	created_at: string;
}

export class ApiKeyService {
	private async ensureMigration() {
		await setupDatabase();
	}

	/**
	 * Generates a new cryptographically secure API key prefixed with api_live_
	 * Hashes the key using SHA-256 for database storage.
	 * Returns the raw key (should be shown only once).
	 */
	async generateKey(userId: string, scopes: string[] = ['read'], expiresDays = 365): Promise<{ apiKey: string; keyId: string }> {
		await this.ensureMigration();

		const prefix = 'api_live_';
		const randomPart = randomBytes(24).toString('hex'); // 192 bits of entropy
		const apiKey = `${prefix}${randomPart}`;
		
		const keyHash = createHash('sha256').update(apiKey).digest('hex');
		const keyId = `${prefix}${randomPart.slice(0, 8)}...`;
		const createdAt = new Date().toISOString();
		const expiresAt = expiresDays 
			? new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString()
			: null;

		await db.execute({
			sql: `INSERT INTO api_keys (key_hash, key_id, user_id, scopes, is_active, expires_at, created_at)
				  VALUES (?, ?, ?, ?, 1, ?, ?)`,
			args: [keyHash, keyId, userId, JSON.stringify(scopes), expiresAt, createdAt]
		});

		return { apiKey, keyId };
	}

	/**
	 * Validates a raw API key.
	 */
	async validateKey(apiKey: string): Promise<{ valid: boolean; userId?: string; scopes?: string[] }> {
		await this.ensureMigration();

		const keyHash = createHash('sha256').update(apiKey).digest('hex');

		const result = await db.execute({
			sql: 'SELECT user_id, scopes, is_active, expires_at FROM api_keys WHERE key_hash = ?',
			args: [keyHash]
		});

		if (result.rows.length === 0) {
			return { valid: false };
		}

		const row = result.rows[0];
		const isActive = row.is_active === 1 || (row.is_active as any) === true;
		
		if (!isActive) {
			return { valid: false };
		}

		if (row.expires_at) {
			const expiresTime = new Date(row.expires_at as string).getTime();
			if (Date.now() > expiresTime) {
				return { valid: false };
			}
		}

		let scopes: string[] = [];
		try {
			scopes = JSON.parse(row.scopes as string);
		} catch {
			scopes = [];
		}

		return {
			valid: true,
			userId: row.user_id as string,
			scopes
		};
	}

	/**
	 * Revokes an API key.
	 */
	async revokeKey(keyId: string): Promise<boolean> {
		await this.ensureMigration();

		const result = await db.execute({
			sql: 'UPDATE api_keys SET is_active = 0 WHERE key_id = ?',
			args: [keyId]
		});

		return result.rowsAffected > 0;
	}
}
