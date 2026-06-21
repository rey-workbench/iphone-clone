import { json } from '@sveltejs/kit';
import { ApiConfig } from '$lib/framework/api/api';
import { isAuthorized } from '$lib/backend/security/AuthValidator';

export async function GET({ request }) {
	try {
        if (!(await isAuthorized(request, null))) {
            return json({ error: 'Unauthorized access to TURN service' }, { status: 403 });
        }

		const keyId = process.env.CLOUDFLARE_TURN_KEY_ID;
		const apiToken = process.env.CLOUDFLARE_TURN_API_TOKEN;

		if (!keyId || !apiToken) {
			return json({ error: 'Missing Cloudflare TURN environment variables' }, { status: 500 });
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
			return json(
				{ error: `Cloudflare API responded with status: ${response.status}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return json({
			iceServers: Array.isArray(data.iceServers) ? data.iceServers : [data.iceServers]
		});
	} catch {
		return json({ error: 'Failed to fetch ICE servers from Cloudflare' }, { status: 500 });
	}
}
