<script lang="ts">
  import { CalculatorState } from './CalculatorState.svelte';

  const state = new CalculatorState();

  let displayText = $derived(state.getDisplayText());
  let fontSize = $derived(state.getFontSize(displayText));
</script>

<div class="h-full pt-[54px] pb-5 flex flex-col bg-black px-3 ">
  <div class="flex-1 flex items-end justify-end px-4 pb-3 min-h-[120px]">
    <div class="text-white font-light text-right leading-tight transition-all" style="font-size: {fontSize}">{displayText}</div>
  </div>
  <div class="flex flex-col gap-3">
    {#each state.buttons as row}
      <div class="flex gap-3 justify-center">
        {#each row as btn}
          <button
            class="w-[78px] h-[78px] rounded-full border-none text-[30px] cursor-pointer flex items-center justify-center transition-all duration-100 active:opacity-70
              {btn.type === 'function' ? 'bg-[#A5A5A5] text-black text-2xl' : ''}
              {btn.type === 'number' || btn.type === 'zero' ? 'bg-[#333] text-white' : ''}
              {btn.type === 'operator' ? (state.activeOp === btn.value ? 'bg-white text-[#FF9F0A]' : 'bg-[#FF9F0A] text-white') + ' text-[34px]' : ''}
              {btn.span === 2 ? 'w-[168px]! rounded-[40px]! pl-7! justify-start!' : ''}"
            onclick={() => state.press(btn)}
          >{btn.label}</button>
        {/each}
      </div>
    {/each}
  </div>
</div>
