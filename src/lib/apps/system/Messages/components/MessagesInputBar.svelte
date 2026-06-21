<script lang="ts">
	import { Plus, Mic, ArrowUp } from '@lucide/svelte';

	interface InputBarAppState {
		inputText: string;
	}

	interface Props {
		appState: InputBarAppState;
		adjustTextareaHeight: (e: Event) => void;
		handleInputKeydown: (e: KeyboardEvent) => void;
		handleSend: () => void;
	}

	const { appState, adjustTextareaHeight, handleInputKeydown, handleSend }: Props = $props();
</script>

<div
	class="flex items-end gap-3 px-3 pt-2 pb-8 border-t border-[#222] bg-black/90 backdrop-blur-md z-20 relative"
>
	<button
		class="w-[32px] h-[32px] rounded-full bg-ios-bg3 flex items-center justify-center shrink-0 border-none cursor-pointer mb-1"
	>
		<Plus size={20} color="#8e8e93" strokeWidth={2.5} />
	</button>

	<div
		class="flex-1 flex items-end bg-ios-bg2 rounded-3xl min-h-[34px] border border-[#333] p-0.5 pl-3 pr-0.5 mb-0.5"
	>
		<textarea
			bind:value={appState.inputText}
			placeholder="iMessage"
			rows="1"
			oninput={adjustTextareaHeight}
			onkeydown={handleInputKeydown}
			class="flex-1 bg-transparent text-white text-[16px] outline-none placeholder:text-[#8e8e93] resize-none overflow-hidden py-1.5 self-center mb-[-2px]"
			style:min-height="22px"
			style:max-height="100px"
			style:padding-top="6px"
			style:padding-bottom="6px"></textarea>

		<div class="shrink-0 flex items-center justify-center h-[30px] w-[30px] ml-1 self-end mb-0.5">
			{#if appState.inputText}
				<button
					class="w-full h-full rounded-full bg-ios-blue border-none text-white cursor-pointer flex items-center justify-center"
					onclick={handleSend}
				>
					<ArrowUp size={18} strokeWidth={3} />
				</button>
			{:else}
				<Mic size={20} color="#8e8e93" strokeWidth={2} />
			{/if}
		</div>
	</div>
</div>
