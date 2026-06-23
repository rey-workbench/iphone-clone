import { BaseGlobalState } from '$lib/os/state/baseGlobalState.svelte';
import { dialogGlobalState } from '$lib/os/state/dialogGlobalState.svelte';
import { SafariApiClient } from '$lib/framework/api/services/SafariApiClient';

import type {
	ISafariSearchResult,
	IScramjetController,
	IWindowWithScramjet,
	IScramjetFrame
} from '$lib/framework/types';

let engineInitPromise: Promise<void> | null = null;

export class SafariAppState extends BaseGlobalState {
	appName = 'Safari';

	url = $state('');
	inputUrl = $state('');
	showInput = $state(false);
	searchResults = $state<ISafariSearchResult[] | null>(null);
	isSearching = $state(false);
	searchError = $state<string | null>(null);
	isReady = $state(false);
	scramjet: IScramjetController | null = null;
	frameObj: (HTMLIFrameElement & IScramjetFrame) | null = null;
	errorMessage = $state('');

	constructor() {
		super();
	}

	async onLaunch() {
		this.isForeground = true;
		await this.initEngine();
	}

	async onSuspend() {
		this.isForeground = false;
	}

	async onResume() {
		this.isForeground = true;
	}

	async onDestroy() {
		this.isForeground = false;
	}

	async initEngine() {
		if (this.isReady) return;

		if (!engineInitPromise) {
			engineInitPromise = this.doInitEngine();
		}

		try {
			await engineInitPromise;
			this.isReady = true;
			this.initFrame();
		} catch (err: unknown) {
			engineInitPromise = null;
			dialogGlobalState.show({
				title: 'Safari Proxy Error',
				message: (err as Error).message || 'Scramjet initialization failed.',
				confirmText: 'OK'
			});
		}
	}

	initFrame() {
		if (!this.frameObj && document.getElementById('safari-container')) {
			const iframe = document.createElement('iframe');
			iframe.className = 'absolute inset-0 w-full h-full border-none bg-white';
			this.frameObj = this.scramjet!.createFrame(iframe) as unknown as HTMLIFrameElement &
				IScramjetFrame;
			document.getElementById('safari-container')!.appendChild(iframe);
			if (this.url) {
				this.frameObj.go(this.url);
			}
		}
	}

	async doInitEngine() {
		if ('serviceWorker' in navigator) {
			const loadScript = (src: string) =>
				new Promise<void>((resolve, reject) => {
					const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
					if (existing) {
						if (existing.dataset.loaded) return resolve();
						existing.addEventListener('load', () => resolve());
						existing.addEventListener('error', reject);
						return;
					}
					const script = document.createElement('script');
					script.src = src;
					script.onload = () => {
						script.dataset.loaded = 'true';
						resolve();
					};
					script.onerror = reject;
					document.head.appendChild(script);
				});

			const win = window as IWindowWithScramjet;
			const origExports = win.exports;
			const origModule = win.module;
			const origDefine = win.define;
			win.exports = undefined;
			win.module = undefined;
			win.define = undefined;

			await loadScript('/api/scramjet-scripts/bundled');
			await loadScript('/api/scramjet-scripts/api');
			await loadScript('/libcurl/index.js');

			win.exports = origExports;
			win.module = origModule;
			win.define = origDefine;

			const LibcurlTransport = win.LibcurlTransport;
			if (!LibcurlTransport?.default) {
				throw new Error(
					'Scramjet/Libcurl scripts failed to load. Missing static/scram/ or static/libcurl/ files.'
				);
			}

			const LibcurlClient = LibcurlTransport.default;
			const isLocal =
				location.hostname === 'localhost' ||
				location.hostname === '127.0.0.1' ||
				location.hostname.startsWith('192.168.') ||
				location.hostname.startsWith('10.') ||
				location.hostname.endsWith('.local') ||
				location.hostname.startsWith('172.');
			const wispUrl = isLocal
				? location.origin.replace(/^http/, 'ws') + '/wisp/'
				: 'wss://wisp.mercurywork.shop/';

			const transport = new LibcurlClient({ wisp: wispUrl });
			await transport.init();

			const scramjetController = win.$scramjetController;
			if (!scramjetController?.Controller) {
				throw new Error('Scramjet Controller not found on window.$scramjetController');
			}
			const { Controller } = scramjetController;
			const registrations = await navigator.serviceWorker.getRegistrations();
			for (const r of registrations) {
				if (r.active?.scriptURL.includes('scramjet-sw.js') && r.scope === location.origin + '/') {
					await r.unregister();
				}
			}

			const reg = await navigator.serviceWorker.register('/scramjet-sw.js', {
				scope: '/scramjet/'
			});

			const waitForActive = (worker: ServiceWorker | null) =>
				new Promise<void>((resolve) => {
					if (!worker) return resolve();
					if (worker.state === 'activated') return resolve();
					worker.addEventListener('statechange', () => {
						if (worker.state === 'activated') resolve();
					});
				});

			if (!reg.active) {
				await waitForActive(reg.installing || reg.waiting);
			}

			const serviceworker = reg.active!;

			this.scramjet = new Controller({
				serviceworker,
				transport,
				config: {
					prefix: '/scramjet/',
					scramjetPath: '/api/scramjet-scripts/bundled',
					injectPath: '/api/scramjet-scripts/inject',
					wasmPath: '/api/scramjet-scripts/wasm'
				}
			});

			await this.scramjet!.wait();

			this.isReady = true;

			// Initialize the frame
			if (!this.frameObj && document.getElementById('safari-container')) {
				const iframe = document.createElement('iframe');
				iframe.className = 'absolute inset-0 w-full h-full border-none bg-white';
				this.frameObj = this.scramjet!.createFrame(iframe) as unknown as HTMLIFrameElement &
					IScramjetFrame;
				document.getElementById('safari-container')!.appendChild(iframe);
				if (this.url) {
					this.frameObj.go(this.url);
				}
			}
		}
	}

	navigate(targetUrl?: string) {
		if (targetUrl) {
			this.url = targetUrl;
			this.inputUrl = targetUrl;
			this.searchResults = null;
			this.showInput = false;
			this.loadFrame();
			return;
		}

		if (this.inputUrl.trim()) {
			const input = this.inputUrl.trim();
			// Basic check if it's a domain/URL or search term
			if (input.includes('.') && !input.includes(' ')) {
				this.url = input.startsWith('http') ? input : `https://${input}`;
				this.searchResults = null;
				this.showInput = false;
				this.loadFrame();
			} else {
				// It's a search term
				this.performSearch(input);
				this.showInput = false;
			}
		}
	}

	loadFrame() {
		if (this.isReady && this.scramjet) {
			setTimeout(() => {
				if (!this.frameObj) {
					const iframe = document.createElement('iframe');
					iframe.className = 'absolute inset-0 w-full h-full border-none bg-white';
					this.frameObj = this.scramjet!.createFrame(iframe) as unknown as HTMLIFrameElement &
						IScramjetFrame;
					const container = document.getElementById('safari-container');
					if (container) {
						container.innerHTML = '';
						container.appendChild(iframe);
					} else {
						// console.warn("[SafariState] safari-container still not found in DOM");
					}
				}
				if (this.frameObj) {
					this.frameObj.go(this.url);
				}
			}, 0);
		}
	}

	async performSearch(query: string) {
		this.isSearching = true;
		this.searchResults = null;
		this.searchError = null;
		try {
			const { res, result: data } = await SafariApiClient.search(query);
			if (!res.ok) throw new Error(data.error || 'Failed to search');
			this.searchResults = data.data || [];
		} catch (e: unknown) {
			dialogGlobalState.show({
				title: 'Safari Error',
				message: (e as Error).message || 'Failed to search',
				confirmText: 'OK'
			});
		} finally {
			this.isSearching = false;
		}
	}

	toggleInput() {
		this.showInput = true;
		this.inputUrl = this.url || '';
	}

	goBack() {
		const iframe = document.querySelector('#safari-container iframe') as HTMLIFrameElement;
		if (iframe && iframe.contentWindow) {
			iframe.contentWindow.history.back();
		}
	}

	goForward() {
		const iframe = document.querySelector('#safari-container iframe') as HTMLIFrameElement;
		if (iframe && iframe.contentWindow) {
			iframe.contentWindow.history.forward();
		}
	}
}
