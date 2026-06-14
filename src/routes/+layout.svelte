<script lang="ts">
	import '../app.css';
	import { pwaInfo } from 'virtual:pwa-info';

	import PwaInstallPrompt from '$lib/sysui/device/PwaInstallPrompt.svelte';

	import StatusBar from '$lib/sysui/status/StatusBar.svelte';
	import { systemGlobalState } from '$lib/os/state';
	import LoginScreen from '$lib/sysui/lockscreen/LoginScreen.svelte';
	import NotificationBanner from '$lib/sysui/notifications/NotificationBanner.svelte';

	import { callState } from '$lib/apps/system/Phone/CallAppState.svelte';
	import IncomingCallScreen from '$lib/apps/system/Phone/components/IncomingCallScreen.svelte';
	import ActiveCallScreen from '$lib/apps/system/Phone/components/ActiveCallScreen.svelte';
	import DialogModal from '$lib/sysui/notifications/DialogModal.svelte';
	import AppSwitcher from '$lib/sysui/appswitcher/AppSwitcher.svelte';
	import ControlCenter from '$lib/sysui/controlcenter/ControlCenter.svelte';
	import { ShellState } from '$lib/os/state/ShellState.svelte';
	import { musicGlobalState } from '$lib/apps/user/Music/MusicAppState.svelte';
	import DeviceFrame from '$lib/sysui/device/DeviceFrame.svelte';
	import LockScreen from '$lib/sysui/lockscreen/LockScreen.svelte';

	// App Registry for the App Switcher to render previews
	import { appsRegistry } from '$lib/apps/registry';
	const appComponents = appsRegistry;

	const state = new ShellState();

	import { setContext } from 'svelte';
	import { os } from '$lib/os/kernel/OS';
	import AppRenderer from '$lib/sysui/components/AppRenderer.svelte';

	setContext('os', os);

	const { children } = $props();

	$effect(() => {
		// 1. PWA Registration
		if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
			import('virtual:pwa-register')
				.then(({ registerSW }) => registerSW({ immediate: true }))
				.catch(() => {});
		}

		// 2. Global OS Initializations
		if (systemGlobalState.currentUser) {
			callState.init();

			if (!systemGlobalState.recentApps.includes('music')) {
				musicGlobalState.destroyPlayer();
			}
		}
	});

	import { afterNavigate } from '$app/navigation';
	afterNavigate(({ to }) => {
		if (to?.route?.id && to.route.id !== '/') {
			const appId = to.route.id.replace('/', '');
			if (appId) systemGlobalState.addRecentApp(appId);
		}
	});
</script>

<svelte:head>
	{#if pwaInfo && pwaInfo.webManifest}
		<link rel="manifest" href={pwaInfo.webManifest.href} crossorigin="use-credentials" />
	{/if}
	<title>IPhone</title>
</svelte:head>

<div class="w-screen h-dvh flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
	<DeviceFrame {state}>
		<!-- MAIN OS CONTENT AREA -->
		{#if !systemGlobalState.isInitializing}
			<!-- Music App Background Process -->
			<div class="absolute inset-0 bg-black flex-col hidden" style:display="none">
				<div id="youtube-player" class="absolute opacity-0 pointer-events-none w-0 h-0"></div>
			</div>

			<AppRenderer {state} />
			{@render children()}
		{/if}

		<!-- Lock Screen Overlay -->
		{#if !systemGlobalState.isInitializing && systemGlobalState.currentUser && state.showLockScreen}
			<LockScreen {state} {systemGlobalState} />
		{/if}

		<!-- Login Screen Overlay -->
		{#if !systemGlobalState.isInitializing && !systemGlobalState.currentUser}
			<div class="absolute inset-0 z-200">
				<LoginScreen />
			</div>
		{/if}

		<!-- Initialization Screen Overlay (Topmost) -->
		{#if systemGlobalState.isInitializing}
			<div class="absolute inset-0 bg-[#0a0a0a] z-1000"></div>
		{/if}

		{#if !systemGlobalState.isInitializing && systemGlobalState.currentUser}
			<!-- Global Status Bar -->
			<StatusBar />
			<AppSwitcher shellState={state} {appComponents} />
		{/if}

		<!-- Global WebRTC Audio Element -->
		<audio
			id="remote-audio"
			autoplay
			playsinline
			style:position="absolute"
			style:width="0"
			style:height="0"
			style:opacity="0"
			style:pointer-events="none"
		></audio>

		<!-- Global Call Overlays (Always accessible) -->
		{#if callState.status === 'incoming'}
			<IncomingCallScreen />
		{:else if callState.status === 'calling' || callState.status === 'active'}
			<ActiveCallScreen />
		{/if}

		<!-- Global Dialog Overlays -->
		<DialogModal />

		<!-- Global Notification Banner -->
		<NotificationBanner />

		<!-- Control Center Overlay -->
		<ControlCenter shellState={state} />

		<PwaInstallPrompt />
	</DeviceFrame>
</div>
