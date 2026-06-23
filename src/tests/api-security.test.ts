import { vi, describe, it, expect, beforeEach } from 'vitest';
import { GET as getNotes, POST as saveNote } from '../routes/api/notes/+server';
import { POST as login } from '../routes/api/auth/login/+server';
import { db } from '$lib/backend/config/turso';

// Mock turso DB client
vi.mock('$lib/backend/config/turso', () => {
	const mockDb = {
		execute: vi.fn(),
		executeMultiple: vi.fn()
	};
	return {
		db: mockDb,
		setupDatabase: vi.fn()
	};
});

// Mock $env/static/private to avoid env loading issues in tests
vi.mock('$env/static/private', () => {
	return {
		DATABASE_URL: 'libsql://dummy.turso.io',
		DATABASE_TOKEN: 'dummy-token'
	};
});

// Mock $env/static/public to avoid Supabase key error in tests
vi.mock('$env/static/public', () => {
	return {
		PUBLIC_SUPABASE_URL: 'https://dummy.supabase.co',
		PUBLIC_SUPABASE_ANON: 'dummy-anon-key'
	};
});

describe('API Security Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Authentication (OWASP API2:2023)', () => {
		it('should reject GET /api/notes if auth headers are missing', async () => {
			const mockEvent = {
				request: new Request('http://localhost/api/notes?userId=user-rey'),
				url: new URL('http://localhost/api/notes?userId=user-rey'),
				getClientAddress: () => '127.0.0.1'
			} as any;

			const response = await getNotes(mockEvent);
			const body = await response.json();

			expect(response.status).toBe(403);
			expect(body.success).toBe(false);
			expect(body.error).toContain('Unauthorized access to API service');
		});

		it('should reject GET /api/notes if device ID does not match registered device', async () => {
			// Mock database return: no device found for this user-device pair
			vi.mocked(db.execute).mockResolvedValue({ rows: [] } as any);

			const mockEvent = {
				request: new Request('http://localhost/api/notes?userId=user-rey', {
					headers: {
						'x-user-id': 'user-rey',
						'x-device-id': 'unregistered-device-id'
					}
				}),
				url: new URL('http://localhost/api/notes?userId=user-rey'),
				getClientAddress: () => '127.0.0.1'
			} as any;

			const response = await getNotes(mockEvent);
			const body = await response.json();

			expect(response.status).toBe(403);
			expect(body.success).toBe(false);
			expect(body.error).toContain('Unauthorized access to API service');
		});

		it('should allow GET /api/notes with valid registered session', async () => {
			// Mock database return: registered device matches headers
			vi.mocked(db.execute).mockImplementation(async (query: any) => {
				if (typeof query === 'object' && query.sql.includes('user_devices')) {
					return {
						rows: [
							{
								id: 'session-1',
								device_id: 'device-rey-mac',
								device_name: 'macOS',
								last_active: '2026-06-23T00:00:00Z',
								created_at: '2026-06-23T00:00:00Z'
							}
						]
					} as any;
				}
				if (typeof query === 'object' && query.sql.includes('notes')) {
					return {
						rows: [
							{
								id: 'note-1',
								user_id: 'user-rey',
								title: 'Hello',
								content: 'World',
								date: '2026-06-23T00:00:00Z'
							}
						]
					} as any;
				}
				return { rows: [] } as any;
			});

			const mockEvent = {
				request: new Request('http://localhost/api/notes?userId=user-rey', {
					headers: {
						'x-user-id': 'user-rey',
						'x-device-id': 'device-rey-mac'
					}
				}),
				url: new URL('http://localhost/api/notes?userId=user-rey'),
				getClientAddress: () => '127.0.0.1'
			} as any;

			const response = await getNotes(mockEvent);
			const body = await response.json();

			expect(response.status).toBe(200);
			expect(body.success).toBe(true);
			expect(body.notes).toBeDefined();
			expect(body.notes[0].title).toBe('Hello');
		});
	});

	describe('Broken Object Level Authorization / BOLA (OWASP API1:2023)', () => {
		it('should reject GET /api/notes if requesting notes of another user ID (IDOR)', async () => {
			// Mock session lookup for user-rey
			vi.mocked(db.execute).mockImplementation(async (query: any) => {
				if (typeof query === 'object' && query.sql.includes('user_devices')) {
					return {
						rows: [{ device_id: 'device-rey-mac' }]
					} as any;
				}
				return { rows: [] } as any;
			});

			// User 'rey' tries to fetch notes of user 'nisa'
			const mockEvent = {
				request: new Request('http://localhost/api/notes?userId=user-nisa', {
					headers: {
						'x-user-id': 'user-rey',
						'x-device-id': 'device-rey-mac'
					}
				}),
				url: new URL('http://localhost/api/notes?userId=user-nisa'),
				getClientAddress: () => '127.0.0.1'
			} as any;

			const response = await getNotes(mockEvent);
			const body = await response.json();

			expect(response.status).toBe(403);
			expect(body.success).toBe(false);
			expect(body.error).toContain('Unauthorized access to user notes');
		});

		it('should reject POST /api/notes if saving a note on behalf of another user ID', async () => {
			// Mock session lookup for user-rey
			vi.mocked(db.execute).mockImplementation(async (query: any) => {
				if (typeof query === 'object' && query.sql.includes('user_devices')) {
					return {
						rows: [{ device_id: 'device-rey-mac' }]
					} as any;
				}
				return { rows: [] } as any;
			});

			const mockEvent = {
				request: new Request('http://localhost/api/notes', {
					method: 'POST',
					headers: {
						'x-user-id': 'user-rey',
						'x-device-id': 'device-rey-mac',
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						id: 'note-new',
						user_id: 'user-nisa', // Owner field is different from auth header user id
						title: 'Hack',
						content: 'Owned'
					})
				}),
				getClientAddress: () => '127.0.0.1'
			} as any;

			const response = await saveNote(mockEvent);
			const body = await response.json();

			expect(response.status).toBe(403);
			expect(body.success).toBe(false);
			expect(body.error).toContain('Unauthorized to save notes for this user');
		});
	});

	describe('Mass Assignment / Schema Validation (OWASP API3:2023)', () => {
		it('should reject POST /api/notes with malformed payloads violating validation constraints', async () => {
			vi.mocked(db.execute).mockImplementation(async (query: any) => {
				if (typeof query === 'object' && query.sql.includes('user_devices')) {
					return { rows: [{ device_id: 'device-rey-mac' }] } as any;
				}
				return { rows: [] } as any;
			});

			const mockEvent = {
				request: new Request('http://localhost/api/notes', {
					method: 'POST',
					headers: {
						'x-user-id': 'user-rey',
						'x-device-id': 'device-rey-mac',
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						id: '', // empty id violates validation (min(1))
						user_id: 'user-rey',
						title: 'Short ID'
					})
				}),
				getClientAddress: () => '127.0.0.1'
			} as any;

			const response = await saveNote(mockEvent);
			const body = await response.json();

			expect(response.status).toBe(500); // Zod parse throws error, mapped to 500
			expect(body.success).toBe(false);
			expect(body.error).toBeDefined();
		});

		it('should reject POST /api/notes if payload contains unrecognized fields (Mass Assignment prevention)', async () => {
			vi.mocked(db.execute).mockImplementation(async (query: any) => {
				if (typeof query === 'object' && query.sql.includes('user_devices')) {
					return { rows: [{ device_id: 'device-rey-mac' }] } as any;
				}
				return { rows: [] } as any;
			});

			const mockEvent = {
				request: new Request('http://localhost/api/notes', {
					method: 'POST',
					headers: {
						'x-user-id': 'user-rey',
						'x-device-id': 'device-rey-mac',
						'content-type': 'application/json'
					},
					body: JSON.stringify({
						id: 'note-123',
						user_id: 'user-rey',
						title: 'Valid Title',
						content: 'Valid content',
						isAdmin: true // Unrecognized property that should be rejected by strict schema
					})
				}),
				getClientAddress: () => '127.0.0.1'
			} as any;

			const response = await saveNote(mockEvent);
			const body = await response.json();

			expect(response.status).toBe(500);
			expect(body.success).toBe(false);
			expect(body.error).toContain('unrecognized_keys');
		});
	});

	describe('API Key Security Controls (OWASP API2:2023)', () => {
		it('should allow GET /api/notes with a valid api_live_ API key', async () => {
			vi.mocked(db.execute).mockImplementation(async (query: any) => {
				if (typeof query === 'object' && query.sql.includes('api_keys')) {
					return {
						rows: [
							{
								user_id: 'user-rey',
								scopes: JSON.stringify(['read']),
								is_active: 1,
								expires_at: null
							}
						]
					} as any;
				}
				if (typeof query === 'object' && query.sql.includes('notes')) {
					return {
						rows: [{ id: 'note-1', user_id: 'user-rey', title: 'Secured Note' }]
					} as any;
				}
				return { rows: [] } as any;
			});

			const mockEvent = {
				request: new Request('http://localhost/api/notes?userId=user-rey', {
					headers: {
						'x-api-key': 'api_live_abcdef1234567890abcdef1234567890'
					}
				}),
				url: new URL('http://localhost/api/notes?userId=user-rey'),
				getClientAddress: () => '127.0.0.1'
			} as any;

			const response = await getNotes(mockEvent);
			const body = await response.json();

			expect(response.status).toBe(200);
			expect(body.success).toBe(true);
			expect(body.notes[0].title).toBe('Secured Note');
		});

		it('should reject GET /api/notes with an invalid or modified API key', async () => {
			vi.mocked(db.execute).mockResolvedValue({ rows: [] } as any); // key not found

			const mockEvent = {
				request: new Request('http://localhost/api/notes?userId=user-rey', {
					headers: {
						'x-api-key': 'api_live_invalidkey'
					}
				}),
				url: new URL('http://localhost/api/notes?userId=user-rey'),
				getClientAddress: () => '127.0.0.1'
			} as any;

			const response = await getNotes(mockEvent);
			const body = await response.json();

			expect(response.status).toBe(403);
			expect(body.success).toBe(false);
			expect(body.error).toContain('Unauthorized access to API service');
		});

		it('should enforce BOLA/IDOR constraints when authenticating via API Key', async () => {
			vi.mocked(db.execute).mockImplementation(async (query: any) => {
				if (typeof query === 'object' && query.sql.includes('api_keys')) {
					return {
						rows: [
							{
								user_id: 'user-rey',
								scopes: JSON.stringify(['read']),
								is_active: 1,
								expires_at: null
							}
						]
					} as any;
				}
				return { rows: [] } as any;
			});

			// User 'rey' tries to fetch notes of user 'nisa' via API Key
			const mockEvent = {
				request: new Request('http://localhost/api/notes?userId=user-nisa', {
					headers: {
						'x-api-key': 'api_live_abcdef1234567890abcdef1234567890'
					}
				}),
				url: new URL('http://localhost/api/notes?userId=user-nisa'),
				getClientAddress: () => '127.0.0.1'
			} as any;

			const response = await getNotes(mockEvent);
			const body = await response.json();

			expect(response.status).toBe(403);
			expect(body.success).toBe(false);
			expect(body.error).toContain('Unauthorized access to user notes');
		});
	});

	describe('Rate Limiting (OWASP API4:2023)', () => {
		it('should enforce rate limits on login requests after 5 attempts', async () => {
			vi.mocked(db.execute).mockResolvedValue({ rows: [] } as any);

			const makeRequest = () =>
				({
					request: new Request('http://localhost/api/auth/login', {
						method: 'POST',
						body: JSON.stringify({
							username: 'rey',
							password: 'wrong-password'
						})
					}),
					getClientAddress: () => '192.168.1.50' // Unique IP for this test suite block
				}) as any;

			// Attempts 1-5: Expect credentials check results
			for (let i = 0; i < 5; i++) {
				const response = await login(makeRequest());
				expect(response.status).not.toBe(429);
			}

			// Attempt 6: Expect rate limiter block
			const response = await login(makeRequest());
			const body = await response.json();

			expect(response.status).toBe(429);
			expect(body.success).toBe(false);
			expect(body.error).toContain('Too many requests');
		});
	});
});
