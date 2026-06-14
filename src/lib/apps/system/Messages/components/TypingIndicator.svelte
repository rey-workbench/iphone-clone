<script lang="ts">
	const tailLeftClasses =
		"relative before:content-[''] before:absolute before:bottom-0 before:-left-2 before:h-5 before:w-5 before:bg-[#26252A] before:rounded-br-[16px] before:-z-10 after:content-[''] after:absolute after:bottom-0 after:-left-[10px] after:w-[10px] after:h-5 after:bg-black after:rounded-br-[10px] after:z-10";
</script>

<div class="flex pl-2 mb-2">
	<div
		class="bg-[#26252A] text-white rounded-[18px] rounded-bl-md px-4 py-3 flex gap-1 items-center {tailLeftClasses}"
	>
		<span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite]"></span>
		<span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite_0.2s]"></span>
		<span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite_0.4s]"></span>
	</div>
</div>
