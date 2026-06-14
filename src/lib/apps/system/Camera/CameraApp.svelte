<script lang="ts">
	import { getContext } from 'svelte';
	import { RefreshCw } from '@lucide/svelte';
	import { CameraAppState } from './CameraAppState.svelte';
	import AppContainer from '$lib/framework/ui/AppContainer.svelte';
	import type { TCameraMode } from '$lib/framework/types';

	const isPreview = getContext<boolean>('isPreview');
	const appState = new CameraAppState(!!isPreview);

	let videoEl: HTMLVideoElement | undefined = $state(undefined);

	$effect(() => {
		appState.onLaunch();
		return () => {
			appState.onDestroy();
		};
	});

	$effect(() => {
		if (videoEl && appState.stream !== undefined) {
			videoEl.srcObject = appState.stream;
		}
	});

	const retake = () => appState.retake();

	const capture = () => {
		if (!videoEl) return;
		const c = document.createElement('canvas');
		c.width = videoEl.videoWidth;
		c.height = videoEl.videoHeight;
		c.getContext('2d')?.drawImage(videoEl, 0, 0);
		appState.savePhoto(c.toDataURL('image/png'));
	};

	const flipCamera = () => appState.flipCamera();
	const setMode = (e: MouseEvent) => {
		const btn = e.currentTarget as HTMLButtonElement;
		appState.mode = btn.dataset.mode as TCameraMode;
	};
</script>

<AppContainer appName="Camera" paddingTop="pt-[54px]" paddingBottom="pb-5" class="relative">
	{#if appState.photoTaken}
		<div class="flex-1 flex items-center justify-center bg-black">
			<img src={appState.photoUrl} alt="Captured" class="max-w-full max-h-full object-contain" />
		</div>
		<div
			class="absolute bottom-0 left-0 right-0 flex justify-between items-center px-8 pb-10 pt-3 bg-linear-to-t from-black/80 to-transparent"
		>
			<button
				class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer"
				onclick={retake}>Retake</button
			>
			<button
				class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer"
				onclick={retake}>Use Photo</button
			>
		</div>
	{:else}
		<!-- Camera viewfinder -->
		<div class="flex-1 relative bg-black">
			<video
				bind:this={videoEl}
				autoplay
				playsinline
				muted
				class="absolute inset-0 w-full h-full object-cover"
			></video>
		</div>
		<div
			class="absolute bottom-0 left-0 right-0 pb-10 pt-4 bg-linear-to-t from-black/80 to-transparent"
		>
			<div class="flex justify-center gap-5 mb-5">
				{#each appState.modes as m (m)}
					<button
						data-mode={m}
						class="bg-transparent border-none text-[13px] font-semibold uppercase tracking-wider cursor-pointer {appState.mode ===
						m
							? 'text-ios-yellow'
							: 'text-white/50'}"
						onclick={setMode}>{m}</button
					>
				{/each}
			</div>
			<div class="flex items-center justify-center gap-14">
				<span class="w-10"></span>
				<button
					class="w-[72px] h-[72px] rounded-full border-[5px] border-white bg-white/20 cursor-pointer active:scale-90 transition-transform"
					onclick={capture}
					aria-label="Capture"
				></button>
				<button
					class="w-10 h-10 rounded-full bg-ios-fill border-none text-white text-lg cursor-pointer flex items-center justify-center"
					onclick={flipCamera}
					aria-label="Flip camera"
				>
					<RefreshCw size={20} color="white" />
				</button>
			</div>
		</div>
	{/if}
</AppContainer>
