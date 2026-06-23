import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, fetch }) => {
	let fileUrl = '';
	let contentType = 'application/javascript';

	if (params.type === 'bundled') {
		fileUrl = '/scram/scramjet_bundled.js';
	} else if (params.type === 'inject') {
		fileUrl = '/scram/controller.inject.js';
	} else if (params.type === 'api') {
		fileUrl = '/scram/controller.api.js';
	} else if (params.type === 'sw') {
		fileUrl = '/scram/controller.sw.js';
	} else if (params.type === 'wasm') {
		fileUrl = '/scram/scramjet.wasm';
		contentType = 'application/wasm';
	} else {
		throw error(404, 'Not found');
	}

	try {
		const response = await fetch(url.origin + fileUrl);
		if (!response.ok) throw new Error('File not found');
		
		const buffer = await response.arrayBuffer();
		return new Response(buffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000'
			}
		});
	} catch (e) {
		throw error(404, 'File not found');
	}
};
