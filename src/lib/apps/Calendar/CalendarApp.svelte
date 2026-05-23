<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import { AppCalendarState } from './CalendarState.svelte';

  const state = new AppCalendarState();
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col ">
  <div class="flex-1 overflow-y-auto px-4 pb-10">
    <div class="flex justify-between items-center px-1 py-2 pb-4">
      <h1 class="text-[34px] font-bold text-white">{state.monthName}</h1>
      <div class="flex gap-4">
        <button class="bg-transparent border-none text-ios-blue text-lg cursor-pointer flex items-center justify-center" onclick={() => state.prevMonth()}>
          <ChevronLeft size={24} />
        </button>
        <button class="bg-transparent border-none text-ios-blue text-lg cursor-pointer flex items-center justify-center" onclick={() => state.nextMonth()}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
    <div class="grid grid-cols-7 gap-y-1 mb-6">
      {#each state.weekdays as wd}
        <div class="text-center text-[11px] font-semibold text-ios-label2 py-1">{wd}</div>
      {/each}
      {#each Array(state.firstDow) as _}
        <div></div>
      {/each}
      {#each Array(state.daysInMonth) as _, i}
        {@const day = i + 1}
        <button class="w-10 h-10 mx-auto rounded-full border-none flex items-center justify-center text-[16px] cursor-pointer transition-colors
          {state.isToday(day) ? 'bg-ios-blue text-white font-semibold' : 'bg-transparent text-white'}" onclick={() => state.selectDay(day)}>
          {day}
        </button>
      {/each}
    </div>
    <div class="bg-ios-bg2 rounded-xl overflow-hidden">
      <div class="text-[13px] font-semibold text-ios-label2 tracking-wider p-3 px-4 border-b border-ios-sep">EVENTS</div>
      {#each state.events as evt, i}
        <div class="flex gap-3 p-3 px-4 items-start">
          <div class="w-1 h-10 rounded-sm shrink-0 mt-0.5" style="background:{evt.color}"></div>
          <div class="flex flex-col gap-0.5"><span class="text-[17px] font-medium text-white">{evt.title}</span><span class="text-[13px] text-ios-label2">{evt.time}</span></div>
        </div>
        {#if i < state.events.length - 1}<div class="h-px bg-ios-sep ml-[52px]"></div>{/if}
      {/each}
    </div>
  </div>
</div>
