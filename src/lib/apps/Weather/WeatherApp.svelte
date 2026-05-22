<script lang="ts">
  import { onMount } from 'svelte';
  import { Sun, CloudSun, Cloud, CloudRain, Moon, Loader2 } from '@lucide/svelte';

  let loading = $state(true);
  let w = $state({
    city: 'San Francisco', temp: 18, condition: 'Partly Cloudy', high: 21, low: 13,
    hourly: [] as any[], daily: [] as any[], tiles: [] as any[]
  });

  let wRange = $state({ min: 8, range: 17 });

  onMount(async () => {
    try {
      let lat = 37.7749;
      let lon = -122.4194;
      let city = 'San Francisco';
      try {
        const geoRes = await fetch('https://ipapi.co/json/');
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          lat = geoData.latitude;
          lon = geoData.longitude;
          city = geoData.city;
        }
      } catch (e) { console.warn('Geolocation failed', e); }

      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,surface_pressure,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`);
      if (res.ok) {
        const data = await res.json();
        
        const getIcon = (code: number, isNight = false) => {
          if (code === 0) return isNight ? Moon : Sun;
          if (code >= 1 && code <= 3) return isNight ? Cloud : CloudSun;
          if (code >= 51 && code <= 82 || code >= 95) return CloudRain;
          return Cloud;
        };

        const conditionDesc = (code: number) => {
          if (code === 0) return 'Clear';
          if (code >= 1 && code <= 3) return 'Partly Cloudy';
          if (code >= 51 && code <= 82 || code >= 95) return 'Rain';
          return 'Cloudy';
        };

        let hourly = [];
        for (let i = 0; i < 8; i++) {
          const timeStr = i === 0 ? 'Now' : new Date(data.hourly.time[i]).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).replace(' ', '');
          const isNight = new Date(data.hourly.time[i]).getHours() < 6 || new Date(data.hourly.time[i]).getHours() > 18;
          hourly.push({ time: timeStr, temp: Math.round(data.hourly.temperature_2m[i]), icon: getIcon(data.hourly.weather_code[i], isNight) });
        }

        let daily = [];
        for (let i = 0; i < 7; i++) {
          const dateObj = new Date(data.daily.time[i]);
          const dayStr = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          daily.push({ day: dayStr, high: Math.round(data.daily.temperature_2m_max[i]), low: Math.round(data.daily.temperature_2m_min[i]), icon: getIcon(data.daily.weather_code[i]) });
        }

        const absMin = Math.min(...daily.map(d => d.low));
        const absMax = Math.max(...daily.map(d => d.high));
        wRange = { min: absMin, range: Math.max(1, absMax - absMin) };

        w = {
          city,
          temp: Math.round(data.current.temperature_2m),
          condition: conditionDesc(data.current.weather_code),
          high: daily[0].high,
          low: daily[0].low,
          hourly,
          daily,
          tiles: [
            { title: 'UV INDEX', value: Math.round(data.daily.uv_index_max[0] || 0).toString(), desc: 'Moderate' },
            { title: 'WIND', value: `${Math.round(data.current.wind_speed_10m)} km/h`, desc: 'Wind' },
            { title: 'FEELS LIKE', value: `${Math.round(data.current.temperature_2m)}°`, desc: 'Similar' },
            { title: 'HUMIDITY', value: `${Math.round(data.current.relative_humidity_2m)}%`, desc: 'Dew pt' },
            { title: 'VISIBILITY', value: '10 km', desc: 'Clear' },
            { title: 'PRESSURE', value: Math.round(data.current.surface_pressure).toString(), desc: 'hPa' },
          ]
        };
      }
    } catch (e) {
      console.error(e);
      w.condition = 'Error loading';
    } finally {
      loading = false;
    }
  });

  function bar(low: number, high: number) {
    const l = Math.max(0, ((low - wRange.min) / wRange.range) * 100);
    const wi = Math.max(0, Math.min(100 - l, ((high - low) / wRange.range) * 100));
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
              <div class="h-[22px] flex items-center justify-center">
                {#if h.icon}
                  <h.icon size={22} color="white" />
                {/if}
              </div>
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
            <div class="w-7 flex justify-center">
              {#if d.icon}
                <d.icon size={20} color="white" />
              {/if}
            </div>
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
