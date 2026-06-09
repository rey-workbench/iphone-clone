import type { RequestEvent } from '@sveltejs/kit';

export async function fallback({ request }: RequestEvent) {
	// If the Service Worker fails to intercept a proxy request, we just return a simple 404
	// to prevent SvelteKit from rendering its full error page or entering an infinite reload loop.
	return new Response('Scramjet proxy route not intercepted by Service Worker.', {
		status: 404,
		headers: {
			'Content-Type': 'text/plain'
		}
	});
}
