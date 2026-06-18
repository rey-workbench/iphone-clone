<script lang="ts">
	import { appleTvState } from '../AppleTVAppState.svelte';
	import Hls from 'hls.js';
	import { ChevronLeft } from '@lucide/svelte';

	import { processManager } from '$lib/os/kernel/ProcessManager.svelte';

	let videoElement: HTMLVideoElement;
	let hls: Hls;

	$effect(() => {
		const channel = appleTvState.activeChannel;
		if (!channel || !videoElement) return;

		// Setup HLS or Native player
		if (Hls.isSupported()) {
			hls = new Hls({
				maxBufferLength: 60,
				maxMaxBufferLength: 600,
				liveSyncDurationCount: 3,
				liveMaxLatencyDurationCount: 10,
				enableWorker: true,
			});
			hls.loadSource(channel.url);
			hls.attachMedia(videoElement);
			
			hls.on(Hls.Events.MANIFEST_PARSED, () => {
				// Only play if the app is currently active
				if (processManager.activeAppId === 'appletv') {
					videoElement.play().catch(e => {
						if (e.name !== 'AbortError') console.error("Playback failed:", e);
					});
				}
			});

			hls.on(Hls.Events.ERROR, function (event, data) {
				if (data.fatal) {
					switch (data.type) {
						case Hls.ErrorTypes.NETWORK_ERROR:
							console.log('Network error encountered, trying to recover...');
							hls.startLoad();
							break;
						case Hls.ErrorTypes.MEDIA_ERROR:
							console.log('Media error encountered, trying to recover...');
							hls.recoverMediaError();
							break;
						default:
							hls.destroy();
							break;
					}
				}
			});
		} else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
			// Safari natively supports HLS
			videoElement.src = channel.url;
			videoElement.addEventListener('loadedmetadata', () => {
				if (processManager.activeAppId === 'appletv') {
					videoElement.play().catch(e => {
						if (e.name !== 'AbortError') console.error("Playback failed:", e);
					});
				}
			});
		}

		return () => {
			if (hls) {
				hls.destroy();
			}
			if (videoElement) {
				videoElement.pause();
				videoElement.removeAttribute('src');
				videoElement.load();
			}
		};
	});

	// Auto pause/play when app focus changes
	$effect(() => {
		const isActive = processManager.activeAppId === 'appletv';
		if (videoElement) {
			if (!isActive) {
				videoElement.pause();
			} else if (appleTvState.activeChannel) {
				videoElement.play().catch(e => {
					if (e.name !== 'AbortError') console.error("Playback failed on resume:", e);
				});
			}
		}
	});

	const handleGoBack = () => {
		appleTvState.closePlayer();
	};
</script>

<div class="absolute inset-0 bg-black z-100 flex items-center justify-center overflow-hidden animate-[fadeIn_0.3s_ease]">
	<!-- Landscape Container for Phone Orientation matching Netflix style -->
	<div class="w-[852px] h-[393px] rotate-90 origin-center relative bg-black flex items-center justify-center">
		<!-- Back Button -->
		<button 
			class="absolute top-8 left-12 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border-none hover:bg-black/70 transition-colors"
			onclick={handleGoBack}
		>
			<ChevronLeft size={24} />
		</button>
		
		<!-- Channel Info -->
		<div class="absolute top-8 left-28 z-50 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl">
			<h2 class="text-white font-medium text-lg">{appleTvState.activeChannel?.name}</h2>
		</div>

		<!-- Video Player -->
		<video
			bind:this={videoElement}
			class="w-full h-full object-contain"
			controls
			autoplay
			playsinline
		>
			<track kind="captions" />
		</video>
	</div>
</div>
