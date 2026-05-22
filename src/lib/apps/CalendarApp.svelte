<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  let selectedDate = $state(new Date());

  let year = $derived(selectedDate.getFullYear());
  let month = $derived(selectedDate.getMonth());
  let monthName = $derived(selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  let daysInMonth = $derived(new Date(year, month + 1, 0).getDate());
  let firstDow = $derived(new Date(year, month, 1).getDay());
  let today = $derived(new Date());
  let isToday = $derived((d: number) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year);

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const events = [
    { time: '9:00 AM', title: 'WWDC Keynote', color: '#007AFF' },
    { time: '12:00 PM', title: 'Lunch with Team', color: '#34C759' },
    { time: '3:00 PM', title: 'Design Review', color: '#FF9500' },
  ];

  function prevMonth() { selectedDate = new Date(year, month - 1, 1); }
  function nextMonth() { selectedDate = new Date(year, month + 1, 1); }
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col ">
  <div class="flex-1 overflow-y-auto px-4 pb-10">
    <div class="flex justify-between items-center px-1 py-2 pb-4">
      <h1 class="text-[34px] font-bold text-white">{monthName}</h1>
      <div class="flex gap-4">
        <button class="bg-transparent border-none text-ios-blue text-lg cursor-pointer flex items-center justify-center" onclick={prevMonth}>
          <ChevronLeft size={24} />
        </button>
        <button class="bg-transparent border-none text-ios-blue text-lg cursor-pointer flex items-center justify-center" onclick={nextMonth}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
    <div class="grid grid-cols-7 gap-y-1 mb-6">
      {#each weekdays as wd}
        <div class="text-center text-[11px] font-semibold text-ios-label2 py-1">{wd}</div>
      {/each}
      {#each Array(firstDow) as _}
        <div></div>
      {/each}
      {#each Array(daysInMonth) as _, i}
        {@const day = i + 1}
        <button class="w-10 h-10 mx-auto rounded-full border-none flex items-center justify-center text-[16px] cursor-pointer transition-colors
          {isToday(day) ? 'bg-ios-blue text-white font-semibold' : 'bg-transparent text-white'}" onclick={() => selectedDate = new Date(year, month, day)}>
          {day}
        </button>
      {/each}
    </div>
    <div class="bg-ios-bg2 rounded-xl overflow-hidden">
      <div class="text-[13px] font-semibold text-ios-label2 tracking-wider p-3 px-4 border-b border-ios-sep">EVENTS</div>
      {#each events as evt, i}
        <div class="flex gap-3 p-3 px-4 items-start">
          <div class="w-1 h-10 rounded-sm shrink-0 mt-0.5" style="background:{evt.color}"></div>
          <div class="flex flex-col gap-0.5"><span class="text-[17px] font-medium text-white">{evt.title}</span><span class="text-[13px] text-ios-label2">{evt.time}</span></div>
        </div>
        {#if i < events.length - 1}<div class="h-px bg-ios-sep ml-[52px]"></div>{/if}
      {/each}
    </div>
  </div>
</div>
