<script lang="ts">
	import { page } from '$app/stores';
	import type { ShellState } from '$lib/os/state/ShellState.svelte';

	const {
		appId,
		appName,
		appColor,
		appComponent: AppComponent,
		cardSwipeY,
		activeSwipeId,
		shellState,
		onCardClick,
		onPointerDown,
		onPointerMove,
		onPointerUp
	} = $props<{
		appId: string;
		appName: string;
		appColor: string;
		appComponent: any;
		cardSwipeY: Record<string, number>;
		activeSwipeId: string | null;
		shellState: ShellState;
		onCardClick: (appId: string) => void;
		onPointerDown: (e: PointerEvent, appId: string) => void;
		onPointerMove: (e: PointerEvent, appId: string) => void;
		onPointerUp: (e: PointerEvent, appId: string) => void;
	}>();

	const handleClick = () => onCardClick(appId);
	const handlePointerDown = (e: PointerEvent) => onPointerDown(e, appId);
	const handlePointerMove = (e: PointerEvent) => onPointerMove(e, appId);
	const handlePointerUp = (e: PointerEvent) => onPointerUp(e, appId);
	const handlePointerCancel = (e: PointerEvent) => onPointerUp(e, appId);
</script>

<div
	class="snap-center shrink-0 w-50 max-[430px]:w-45 h-100 max-[430px]:h-90 flex flex-col gap-3 transition-transform"
	style:transform="translateY(-{cardSwipeY[appId] || 0}px)"
	style:transition={activeSwipeId === appId ? 'none' : 'transform 0.3s'}
	style:opacity={$page.url.pathname === '/' + appId && !shellState.showAppSwitcher ? 0 : 1}
>
	<button
		class="flex-1 w-full rounded-4xl {appColor} shadow-2xl flex items-center justify-center relative overflow-hidden outline-none touch-pan-x border border-white/10 bg-black"
		onclick={handleClick}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerCancel}
	>
		{#if AppComponent}
			<div
				class="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
			>
				<div
					class="w-107.5 h-233 shrink-0"
					style:transform="scale(0.465)"
					style:transform-origin="center"
				>
					<AppComponent />
				</div>
			</div>
		{:else}
			<span class="text-white text-xl font-semibold opacity-50 mix-blend-difference">{appName}</span
			>
		{/if}
	</button>

	<div class="text-center text-white font-medium text-sm drop-shadow-md">
		{appName}
	</div>
</div>
