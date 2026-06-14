<script lang="ts">
	import type { ShellState } from '$lib/os/state/ShellState.svelte';
	import type { Snippet } from 'svelte';

	const {
		state,
		children
	}: {
		state: ShellState;
		children: Snippet;
	} = $props();

	import { os } from '$lib/os/kernel/OS';

	function handleGoHome() {
		if (os.process.activeAppId) {
			os.process.minimize(os.process.activeAppId);
		}
		state.closeApp();
	}

	const handlePointerMove = (e: PointerEvent) => {
		if (state.isAppSwiping) state.handleAppSwipeMove(e);
		if (state.isControlCenterDragging) state.handleControlCenterSwipeMove(e);
	};

	const handlePointerUp = () => {
		if (state.isAppSwiping) state.handleAppSwipeEnd(() => handleGoHome());
		if (state.isControlCenterDragging) state.handleControlCenterSwipeEnd();
	};

	const handleControlCenterStart = (e: Event) =>
		state.handleControlCenterSwipeStart(e as PointerEvent);
	const handleAppSwipeStart = (e: Event) => state.handleAppSwipeStart(e as any);
</script>

<svelte:window onpointermove={handlePointerMove} onpointerup={handlePointerUp} />

<div
	class="relative w-98.25 h-213 rounded-[48px] overflow-hidden bg-black shadow-[0_0_0_2px_#333,0_0_0_4px_#1a1a1a,0_0_60px_rgba(0,0,0,0.5),0_0_120px_rgba(0,0,0,0.3)] border border-white/5 max-[430px]:w-screen max-[430px]:h-dvh max-[430px]:rounded-none max-[430px]:shadow-none max-[430px]:border-none"
>
	<!-- Notch -->
	<div
		class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-3xl z-10000"
	></div>

	<div
		class="absolute top-0 right-0 w-24 h-10 z-10001 touch-none"
		onpointerdown={handleControlCenterStart}
		ontouchstart={handleControlCenterStart}
		role="presentation"
	></div>

	{@render children()}

	<!-- Global Home Indicator Button -->
	{#if !state.showLockScreen}
		<button
			class="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-10 max-[430px]:h-[calc(2.5rem+env(safe-area-inset-bottom))] z-9000 bg-transparent border-none cursor-pointer flex flex-col justify-end items-center pb-3 max-[430px]:pb-[max(12px,env(safe-area-inset-bottom))] outline-none touch-none"
			onclick={handleGoHome}
			ontouchstart={handleAppSwipeStart}
			onpointerdown={handleAppSwipeStart}
			aria-label="Home"
		>
			<div class="w-33.5 h-1.25 bg-white/30 rounded-full pointer-events-none"></div>
		</button>
	{/if}
</div>
