<script lang="ts">
  const w = {
    city: 'San Francisco', temp: 18, condition: 'Partly Cloudy', high: 21, low: 13,
    hourly: [
      { time: 'Now', temp: 18, icon: '🌤️' }, { time: '1PM', temp: 19, icon: '☀️' }, { time: '2PM', temp: 20, icon: '☀️' },
      { time: '3PM', temp: 21, icon: '🌤️' }, { time: '4PM', temp: 20, icon: '⛅' }, { time: '5PM', temp: 19, icon: '🌥️' },
      { time: '6PM', temp: 18, icon: '🌥️' }, { time: '7PM', temp: 17, icon: '🌙' },
    ],
    daily: [
      { day: 'Today', high: 21, low: 13, icon: '🌤️' }, { day: 'Mon', high: 22, low: 14, icon: '☀️' },
      { day: 'Tue', high: 20, low: 12, icon: '⛅' }, { day: 'Wed', high: 19, low: 11, icon: '🌧️' },
      { day: 'Thu', high: 18, low: 10, icon: '🌧️' }, { day: 'Fri', high: 21, low: 13, icon: '🌤️' },
      { day: 'Sat', high: 23, low: 15, icon: '☀️' },
    ],
    tiles: [
      { title: 'UV INDEX', value: '4', desc: 'Moderate' }, { title: 'WIND', value: '15 km/h', desc: 'W Wind' },
      { title: 'FEELS LIKE', value: '17°', desc: 'Similar' }, { title: 'HUMIDITY', value: '68%', desc: 'Dew pt 12°' },
      { title: 'VISIBILITY', value: '16 km', desc: 'Clear' }, { title: 'PRESSURE', value: '1013', desc: 'hPa' },
    ]
  };

  function bar(low: number, high: number) {
    const l = ((low - 8) / 17) * 100, wi = ((high - low) / 17) * 100;
    return `left:${l}%;width:${wi}%`;
  }
</script>

<div class="h-full pt-[54px] pb-5 relative overflow-hidden">
  <div class="absolute inset-0 bg-linear-to-b from-[#4A90D9] via-[#6BB3F0] via-60% to-[#9DD1E8]"></div>
  <div class="relative z-10 h-full overflow-y-auto ">
    <div class="text-center px-5 ">
      <h1 class="text-[32px] font-normal text-white">{w.city}</h1>
      <div class="text-[96px] font-extralight text-white leading-none -my-1">{w.temp}°</div>
      <p class="text-lg text-white/90 mt-0.5">{w.condition}</p>
      <p class="text-lg text-white font-medium">H:{w.high}° L:{w.low}°</p>
    </div>
    <div class="px-4 pb-10 flex flex-col gap-2.5">
      <div class="rounded-[14px] p-3 px-4 bg-white/12 backdrop-blur-[20px] border border-white/20">
        <div class="text-xs font-semibold text-white/50 tracking-wider mb-2.5">HOURLY FORECAST</div>
        <div class="flex gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1">
          {#each w.hourly as h}
            <div class="flex flex-col items-center gap-1.5 min-w-[44px]">
              <span class="text-[13px] font-medium text-white">{h.time}</span>
              <span class="text-[22px]">{h.icon}</span>
              <span class="text-[16px] font-semibold text-white">{h.temp}°</span>
            </div>
          {/each}
        </div>
      </div>
      <div class="rounded-[14px] p-3 px-4 bg-white/12 backdrop-blur-[20px] border border-white/20">
        <div class="text-xs font-semibold text-white/50 tracking-wider mb-2.5">10-DAY FORECAST</div>
        {#each w.daily as d, i}
          <div class="flex items-center py-1.5 gap-2">
            <span class="text-[16px] font-medium text-white w-11">{d.day}</span>
            <span class="text-[20px] w-7 text-center">{d.icon}</span>
            <span class="text-[16px] text-white/60 w-8 text-right">{d.low}°</span>
            <div class="flex-1 h-1 bg-white/15 rounded-sm relative"><div class="absolute h-full rounded-sm bg-linear-to-r from-[#4CD964] via-[#FFCC00] to-[#FF6B35]" style={bar(d.low,d.high)}></div></div>
            <span class="text-[16px] text-white w-8 text-right">{d.high}°</span>
          </div>
          {#if i < w.daily.length - 1}<div class="h-px bg-white/15"></div>{/if}
        {/each}
      </div>
      <div class="grid grid-cols-2 gap-2.5">
        {#each w.tiles as t}
          <div class="rounded-[14px] p-3.5 bg-white/12 backdrop-blur-[20px] border border-white/20 min-h-[100px] flex flex-col">
            <div class="text-xs font-semibold text-white/50 tracking-wider mb-2">{t.title}</div>
            <div class="text-[28px] font-normal text-white leading-tight">{t.value}</div>
            <div class="text-[13px] text-white/70 mt-auto">{t.desc}</div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
