<script lang="ts">
	import { CalendarClock } from '@lucide/svelte';
</script>

<div class="w-full h-full pt-16 px-4 flex flex-col items-center justify-center text-center pb-20">
	<div
		class="w-24 h-24 rounded-full bg-linear-to-b from-[#222] to-[#111] flex items-center justify-center mb-6 shadow-xl border border-[#333]"
	>
		<CalendarClock size={40} class="text-[#a6a6a6]" strokeWidth={1.5} />
	</div>
	<h2 class="text-[22px] font-bold mb-3 tracking-wide">Coming Soon</h2>
	<p class="text-[15px] text-[#8c8c8c] max-w-[280px] leading-relaxed">
		Keep track of the new movies and shows coming to Netflix.
	</p>

	<button
		class="mt-8 bg-transparent border-2 border-white text-white rounded font-bold px-8 py-2.5 hover:bg-white hover:text-black transition-colors cursor-pointer"
	>
		Explore New Releases
	</button>
</div>
