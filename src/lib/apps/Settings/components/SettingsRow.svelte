<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import type { Component } from 'svelte';

	const { item, onClick } = $props<{
		item: {
			id: string;
			label: string;
			bg: string;
			icon: Component;
			toggle?: boolean;
			value?: boolean;
			detail?: string;
		};
		onClick?: (e: MouseEvent) => void;
	}>();

	const handleClick = (e: MouseEvent) => {
		if (onClick) onClick(e);
	};
</script>

<button
	data-id={item.id}
	class="flex items-center gap-3 py-2.75 px-4 w-full border-none bg-transparent cursor-pointer text-white text-left"
	onclick={handleClick}
>
	<div
		class="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
		style:background={item.bg}
	>
		<item.icon size={16} color="white" />
	</div>
	<div class="flex-1 text-[17px]">{item.label}</div>
	{#if item.toggle}
		<div
			class="w-12.75 h-7.75 rounded-2xl relative transition-colors duration-200 shrink-0"
			class:bg-ios-green={item.value}
			class:bg-ios-bg3={!item.value}
		>
			<div
				class="w-6.75 h-6.75 rounded-full bg-white absolute top-0.5 left-0.5 transition-transform duration-200 shadow-md"
				class:translate-x-5={item.value}
			></div>
		</div>
	{:else}
		{#if item.detail}
			<span class="text-[15px] text-ios-label2 mr-1">{item.detail}</span>
		{/if}
		<ChevronRight size={14} color="rgba(255,255,255,0.3)" />
	{/if}
</button>
