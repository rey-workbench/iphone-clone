import { json } from '@sveltejs/kit';
import { apiWrapper } from '$lib/backend/api';
import { ApiConfig } from '$lib/framework/api/api';
import { RateLimiter } from '$lib/backend/security/RateLimiter';

const turnRateLimiter = new RateLimiter(60 * 1000, 5, 5 * 60 * 1000); // 5 requests per minute

export const GET = apiWrapper(async () => {
	const keyId = process.env.CLOUDFLARE_TURN_KEY_ID;
	const apiToken = process.env.CLOUDFLARE_TURN_API_TOKEN;

	if (!keyId || !apiToken) {
		throw new Error('TURN server credentials not configured');
	}

	const url = `${ApiConfig.TURN_CREDENTIALS}/${keyId}/credentials/generate`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ ttl: 86400 })
	});

	if (!response.ok) {
		throw new Error(`Cloudflare API error: ${response.statusText}`);
	}

	const data = await response.json();
	return json(data.result);
}, { customRateLimiter: turnRateLimiter });
