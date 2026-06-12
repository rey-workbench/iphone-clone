<script lang="ts">
  ;
  import { clockState } from '$lib/apps/Clock/ClockState.svelte';
  import { Globe, AlarmClock, Timer, Hourglass } from '@lucide/svelte';

  let tab: 'worldClock' | 'alarm' | 'stopwatch' | 'timer' = $state('worldClock');
  let swMs = $state(0);
  let swRunning = $state(false);
  let swInt: ReturnType<typeof setInterval> | null = $state(null);
  let timerSec = $state(300);
  let timerRunning = $state(false);
  let timerInt: ReturnType<typeof setInterval> | null = $state(null);

  const clocks = [
    { city: 'Cupertino', offset: -7, label: 'Today, -3HRS' },
    { city: 'New York', offset: -4, label: 'Today, +0HRS' },
    { city: 'London', offset: 1, label: 'Tomorrow, +5HRS' },
    { city: 'Tokyo', offset: 9, label: 'Tomorrow, +13HRS' },
    { city: 'Sydney', offset: 11, label: 'Tomorrow, +15HRS' },
  ];

  let alarms = $derived(clockState.alarms);

  function getTime(offset: number) {
    const d = new Date(), utc = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * offset).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function toggleSW() {
    swRunning = !swRunning;
    if (swRunning) { const s = Date.now() - swMs; swInt = setInterval(() => { swMs = Date.now() - s }, 10); }
    else if (swInt) { clearInterval(swInt); }
  }
  function resetSW() { swRunning = false; if (swInt) clearInterval(swInt); swMs = 0; }
  function fmtSW(ms: number) { const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000), c = Math.floor((ms % 1000) / 10); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(c).padStart(2,'0')}`; }
  function fmtT(sec: number) { return `${String(Math.floor(sec / 60)).padStart(2,'0')}:${String(sec % 60).padStart(2,'0')}`; }

  function toggleTimer() {
    timerRunning = !timerRunning;
    if (timerRunning) { timerInt = setInterval(() => { if (timerSec > 0) timerSec--; else { timerRunning = false; if (timerInt) clearInterval(timerInt); } }, 1000); }
    else if (timerInt) { clearInterval(timerInt); }
  }
  function resetTimer() { timerRunning = false; if (timerInt) clearInterval(timerInt); timerSec = 300; }

  function toggleAlarm(id: string) { clockState.toggleAlarm(id); }

  $effect(() => () => () => { if (swInt) clearInterval(swInt); if (timerInt) clearInterval(timerInt); });

  const tabs: { id: 'worldClock' | 'alarm' | 'stopwatch' | 'timer'; label: string; icon: any }[] = [
    { id: 'worldClock', label: 'World Clock', icon: Globe },
    { id: 'alarm', label: 'Alarm', icon: AlarmClock },
    { id: 'stopwatch', label: 'Stopwatch', icon: Timer },
    { id: 'timer', label: 'Timer', icon: Hourglass },
  ];

  const setTab = (e: MouseEvent) => {
    const btn = e.currentTarget as HTMLButtonElement;
    tab = btn.dataset.id as any;
  };

  const handleToggleAlarm = (e: MouseEvent) => {
    const btn = e.currentTarget as HTMLButtonElement;
    toggleAlarm(btn.dataset.id!);
  };
</script>

<div class="h-full pt-13.5 pb-0 bg-black flex flex-col ">
  <div class="flex-1 overflow-y-auto px-4 ">
    {#if tab === 'worldClock'}
      <div class="text-[34px] font-bold text-white px-1 py-2 pb-4">World Clock</div>
      <div class="bg-ios-bg2 rounded-xl overflow-hidden">
        {#each clocks as wc, i (i)}
          <div class="flex items-center justify-between p-3 px-4">
            <div class="flex flex-col gap-0.5"><span class="text-[13px] text-ios-label2">{wc.label}</span><span class="text-[17px] text-white font-medium">{wc.city}</span></div>
            <span class="text-[42px] font-extralight text-white">{getTime(wc.offset)}</span>
          </div>
          {#if i < clocks.length - 1}<div class="h-px bg-ios-sep ml-4"></div>{/if}
        {/each}
      </div>
    {:else if tab === 'alarm'}
      <div class="text-[34px] font-bold text-white px-1 py-2 pb-4">Alarm</div>
      <div class="bg-ios-bg2 rounded-xl overflow-hidden">
        {#each alarms as alarm, i (i)}
          <div class="flex items-center justify-between p-3 px-4">
            <div class="flex flex-col gap-0.5"><span class="text-[48px] font-extralight text-white">{alarm.time}</span><span class="text-[13px] text-ios-label2">{alarm.label}, {alarm.days}</span></div>
            <button data-id={alarm.id} class="w-12.75 h-7.75 rounded-2xl relative transition-colors border-none cursor-pointer shrink-0 {alarm.enabled ? 'bg-ios-green' : 'bg-[#39393D]'}" onclick={handleToggleAlarm} aria-label="Toggle {alarm.label} alarm">
              <div class="w-6.75 h-6.75 rounded-full bg-white absolute top-0.5 left-0.5 transition-transform shadow-md {alarm.enabled ? 'translate-x-5' : ''}"></div>
            </button>
          </div>
          {#if i < alarms.length - 1}<div class="h-px bg-ios-sep ml-4"></div>{/if}
        {/each}
      </div>
    {:else if tab === 'stopwatch'}
      <div class="text-[34px] font-bold text-white px-1 py-2 pb-4">Stopwatch</div>
      <div class="text-[72px] font-extralight text-white text-center py-15 tabular-nums">{fmtSW(swMs)}</div>
      <div class="flex justify-center gap-7.5 px-5">
        <button class="w-20 h-20 rounded-full border-2 border-ios-gray bg-ios-gray/20 text-white text-[16px] font-medium cursor-pointer" onclick={resetSW}>Reset</button>
        <button class="w-20 h-20 rounded-full border-2 cursor-pointer text-[16px] font-medium {swRunning ? 'border-ios-red bg-ios-red/20 text-ios-red' : 'border-ios-green bg-ios-green/20 text-ios-green'}" onclick={toggleSW}>{swRunning ? 'Stop' : 'Start'}</button>
      </div>
    {:else}
      <div class="text-[34px] font-bold text-white px-1 py-2 pb-4">Timer</div>
      <div class="text-[72px] font-extralight text-white text-center py-15 tabular-nums">{fmtT(timerSec)}</div>
      <div class="flex justify-center gap-7.5 px-5">
        <button class="w-20 h-20 rounded-full border-2 border-ios-gray bg-ios-gray/20 text-white text-[16px] font-medium cursor-pointer" onclick={resetTimer}>Cancel</button>
        <button class="w-20 h-20 rounded-full border-2 cursor-pointer text-[16px] font-medium {timerRunning ? 'border-ios-red bg-ios-red/20 text-ios-red' : 'border-ios-green bg-ios-green/20 text-ios-green'}" onclick={toggleTimer}>{timerRunning ? 'Pause' : 'Start'}</button>
      </div>
    {/if}
  </div>
  <div class="flex bg-[rgba(30,30,30,0.95)] backdrop-blur-[20px] border-t border-ios-sep pt-1.5 pb-8 shrink-0 justify-around">
    {#each tabs as t (t.id || t)}
      <button data-id={t.id} class="flex-1 flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer py-1 {tab === t.id ? 'text-[#FF9F0A]' : 'text-ios-label2'}" onclick={setTab}>
        <t.icon size={24} />
        <span class="text-[10px] font-medium">{t.label}</span>
      </button>
    {/each}
  </div>
</div>
