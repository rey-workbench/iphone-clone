<script lang="ts">
  import type { WeatherState } from "../WeatherState.svelte";

  let { state } = $props<{ state: WeatherState }>();
</script>

<div class="rounded-[14px] p-3 px-4 bg-white/12 backdrop-blur-[20px] border border-white/20">
  <div class="text-xs font-semibold text-white/50 tracking-wider mb-2.5">
    10-DAY FORECAST
  </div>
  {#each state.w.daily as d, i (i)}
    <div class="flex items-center py-1.5 gap-2">
      <span class="text-[16px] font-medium text-white w-11">{d.day}</span>
      <div class="w-7 flex justify-center">
        {#if d.icon}
          <d.icon size={20} color="white" />
        {/if}
      </div>
      <span class="text-[16px] text-white/60 w-8 text-right">{d.low}°</span>
      <div class="flex-1 h-1 bg-white/15 rounded-sm relative">
        <div
          class="absolute h-full rounded-sm bg-linear-to-r from-[#4CD964] via-[#FFCC00] to-[#FF6B35]"
          style:left="{state.bar(d.low, d.high).left}%"
          style:width="{state.bar(d.low, d.high).width}%"
        ></div>
      </div>
      <span class="text-[16px] text-white w-8 text-right">{d.high}°</span>
    </div>
    {#if i < state.w.daily.length - 1}
      <div class="h-px bg-white/15"></div>
    {/if}
  {/each}
</div>
