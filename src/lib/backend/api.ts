import { json } from '@sveltejs/kit';

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

export async function apiHandler(callback: () => Promise<unknown> | unknown) {
	try {
		const result = await callback();
		// If the callback returns a raw Response object (e.g. from json()), return it directly
		if (result instanceof Response) return result;

		// Otherwise, wrap in { success: true, ...result } if it's an object
		return json({ success: true, ...(typeof result === 'object' ? result : {}) });
	} catch (e: unknown) {
		console.error('API Error:', (e as Error).message);
		const status = e instanceof ApiError ? e.status : (e as any).status || 500;
		return json({ success: false, error: (e as Error).message || String(e) }, { status });
	}
}
