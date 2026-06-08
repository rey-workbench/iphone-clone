import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';
import { server as wispServer } from '@mercuryworkshop/wisp-js';

function wispServerPlugin() {
	return {
		name: 'wisp-server',
		configureServer(server: any) {
			server.httpServer.on('upgrade', (req: any, socket: any, head: any) => {
				if (req.url?.startsWith('/wisp/')) {
					wispServer.routeRequest(req, socket, head);
				}
			});
		}
	};
}

export default defineConfig({
	plugins: [
		wispServerPlugin(),
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true,
				suppressWarnings: true
			},
			manifest: {
				name: 'iOS 26 Clone',
				short_name: 'iOS Clone',
				description: 'iOS 26 Clone built with SvelteKit',
				theme_color: '#000000',
				background_color: '#000000',
				display: 'standalone',
				icons: [
					{
						src: '/assets/favicon.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/assets/favicon.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			}
		})
	]
});
