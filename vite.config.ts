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
