import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			workbox: {
				maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
			},
			devOptions: {
				enabled: true,
				suppressWarnings: true
			},
			disable: process.env.VERCEL === '1',
			manifest: {
				name: 'MyPhone',
				short_name: 'MyPhone',
				description: 'MyPhone Simulator built with SvelteKit',
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
