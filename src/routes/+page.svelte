<script lang="ts">
	import AppIcon from '$lib/sysui/springboard/AppIcon.svelte';
	import Dock from '$lib/sysui/springboard/Dock.svelte';
	import { homeScreenApps } from '$lib/config/apps';

	import { ShellState } from '$lib/core/states/ShellState.svelte';

	// Note: we might need a simpler state for just the home screen,
	// but for now we can instantiate or import a local state instance.
	const state = new ShellState();

	const handlePageChange = (e: MouseEvent) => {
		const page = (e.currentTarget as HTMLElement).dataset.page;
		if (page !== undefined) {
			state.currentPage = parseInt(page, 10);
		}
	};
</script>

<!-- Home Screen -->
<div class="absolute inset-0 flex flex-col animate-[fadeIn_0.3s_ease-out]">
	<!-- Wallpaper -->
	<div class="absolute inset-0 overflow-hidden">
		<div
			class="absolute inset-0 bg-linear-to-br from-[#0f0c29] via-[#302b63] via-40% to-[#16213e]"
		></div>
		<div
			class="absolute w-50 h-50 rounded-full top-[15%] left-[-20%] bg-gradient-radial from-[#667eea] to-[#764ba2] blur-[60px] opacity-40 animate-[orbFloat_20s_ease-in-out_infinite]"
		></div>
		<div
			class="absolute w-45 h-45 rounded-full top-[50%] right-[-15%] bg-gradient-radial from-[#f093fb] to-[#f5576c] blur-[60px] opacity-40 animate-[orbFloat_20s_ease-in-out_infinite_-7s]"
		></div>
		<div
			class="absolute w-37.5 h-37.5 rounded-full bottom-[20%] left-[20%] bg-gradient-radial from-[#4facfe] to-[#00f2fe] blur-[60px] opacity-40 animate-[orbFloat_20s_ease-in-out_infinite_-14s]"
		></div>
	</div>

	<div class="relative z-10 flex-1 flex flex-col px-4 overflow-hidden">
		<div class="grid grid-cols-4 justify-items-center pt-[80px] gap-x-[8px] gap-y-[32px]">
			{#each homeScreenApps[state.currentPage] as app (app.id || app)}
				<AppIcon {app} />
			{/each}
		</div>

		<div class="flex justify-center mt-auto mb-[110px] gap-[6px]">
			{#each homeScreenApps as _, i (i)}
				<button
					data-page={i}
					class="p-1 border-none bg-transparent cursor-pointer flex items-center justify-center"
					onclick={handlePageChange}
					aria-label="Page {i + 1}"
				>
					<div
						class="w-1.5 h-1.5 rounded-full transition-all duration-300 {i === state.currentPage
							? 'bg-white shadow-[0_0_2px_rgba(0,0,0,0.5)] scale-125'
							: 'bg-white/40'}"
					></div>
				</button>
			{/each}
		</div>
	</div>

	<Dock />
</div>
