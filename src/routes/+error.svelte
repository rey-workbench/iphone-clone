<script lang="ts">
	import { page } from '$app/stores';

	const goHome = () => {
		if (typeof window !== 'undefined') {
			window.location.href = '/';
		}
	};
</script>

<div
	class="h-full w-full bg-black text-white flex flex-col items-center justify-center p-6 text-center"
>
	<div class="bg-gray-900 rounded-2xl p-8 max-w-sm w-full border border-gray-800">
		<div
			class="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-8 w-8"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
		</div>

		<h1 class="text-xl font-bold mb-2">Something went wrong</h1>

		<p class="text-gray-400 text-sm mb-6">
			{$page.error?.message || 'An unexpected error occurred'}
		</p>

		<button
			class="bg-white text-black font-semibold py-3 px-6 rounded-full w-full active:scale-95 transition-transform"
			onclick={goHome}
		>
			Return to Home
		</button>
	</div>
</div>
