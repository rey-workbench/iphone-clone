<script lang="ts">
	import { processManager } from './ProcessManager.svelte';
	import type { ShellState } from '$lib/core/states/ShellState.svelte';

	const { state }: { state: ShellState } = $props();
</script>

{#each processManager.runningApps as proc (proc.appId)}
	{@const Component = proc.component}
	{#if !proc.isSuspended}
		<div
			class="absolute inset-0 z-50 flex flex-col {proc.appId === processManager.activeAppId &&
			!state.showAppSwitcher
				? 'bg-black'
				: ''} {proc.appId === processManager.activeAppId && state.appTransition
				? 'animate-[appClose_0.3s_cubic-bezier(0.23,1,0.32,1)_forwards]'
				: proc.appId === processManager.activeAppId && !state.appTransition
					? 'animate-[appOpen_0.35s_cubic-bezier(0.23,1,0.32,1)]'
					: ''}"
			style:display={!proc.minimized ? 'flex' : 'none'}
			style:z-index={proc.zIndex}
			style:transform={proc.appId === processManager.activeAppId && state.isAppSwiping
				? `scale(${Math.max(0.465, 1 - state.appSwipeY / 500)}) translateY(-${state.appSwipeY * 0.6}px)`
				: undefined}
			style:border-radius={proc.appId === processManager.activeAppId && state.isAppSwiping
				? `${Math.min(state.appSwipeY / 2, 48)}px`
				: undefined}
			style:overflow={proc.appId === processManager.activeAppId && state.isAppSwiping
				? 'hidden'
				: undefined}
			style:transition={proc.appId === processManager.activeAppId && state.isAppSwiping
				? 'none'
				: 'all 0.3s cubic-bezier(0.23,1,0.32,1)'}
		>
			<div class="flex-1 overflow-hidden relative flex flex-col">
				<div class="flex-1 overflow-hidden relative">
					<Component />
				</div>
			</div>
		</div>
	{/if}
{/each}
