import { Sun, CloudSun, Cloud, CloudRain, Moon } from '@lucide/svelte';
import { ApiConfig } from '$lib/config/api';
import type { WeatherData, WeatherRange, WeatherHourly, WeatherDaily, WeatherTile } from '$lib/types';

export class WeatherState {
    loading = $state(true);
    w = $state<WeatherData>({
        city: 'San Francisco', temp: 18, condition: 'Partly Cloudy', high: 21, low: 13,
        hourly: [], daily: [], tiles: []
    });
    wRange = $state<WeatherRange>({ min: 8, range: 17 });

    constructor() {}

    async init() {
        this.loading = true;
        try {
            let lat = 37.7749;
            let lon = -122.4194;
            let city = 'San Francisco';
            try {
                const geoData = await ApiConfig.fetchWeatherIP();
                if (geoData) {
                    lat = geoData.latitude;
                    lon = geoData.longitude;
                    city = geoData.city;
                }
            } catch (e) { console.warn('Geolocation failed', e); }

            const data = await ApiConfig.fetchWeatherForecast(lat, lon);
            if (data) {
                
                let hourly: WeatherHourly[] = [];
                for (let i = 0; i < 8; i++) {
                    const timeStr = i === 0 ? 'Now' : new Date(data.hourly.time[i]).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).replace(' ', '');
                    const isNight = new Date(data.hourly.time[i]).getHours() < 6 || new Date(data.hourly.time[i]).getHours() > 18;
                    hourly.push({ time: timeStr, temp: Math.round(data.hourly.temperature_2m[i]), icon: this.getIcon(data.hourly.weather_code[i], isNight) });
                }

                let daily: WeatherDaily[] = [];
                for (let i = 0; i < 7; i++) {
                    const dateObj = new Date(data.daily.time[i]);
                    const dayStr = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    daily.push({ day: dayStr, high: Math.round(data.daily.temperature_2m_max[i]), low: Math.round(data.daily.temperature_2m_min[i]), icon: this.getIcon(data.daily.weather_code[i]) });
                }

                const absMin = Math.min(...daily.map(d => d.low));
                const absMax = Math.max(...daily.map(d => d.high));
                this.wRange = { min: absMin, range: Math.max(1, absMax - absMin) };

                this.w = {
                    city,
                    temp: Math.round(data.current.temperature_2m),
                    condition: this.conditionDesc(data.current.weather_code),
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
            this.w.condition = 'Error loading';
        } finally {
            this.loading = false;
        }
    }

    getIcon(code: number, isNight = false) {
        if (code === 0) return isNight ? Moon : Sun;
        if (code >= 1 && code <= 3) return isNight ? Cloud : CloudSun;
        if (code >= 51 && code <= 82 || code >= 95) return CloudRain;
        return Cloud;
    }

    conditionDesc(code: number) {
        if (code === 0) return 'Clear';
        if (code >= 1 && code <= 3) return 'Partly Cloudy';
        if (code >= 51 && code <= 82 || code >= 95) return 'Rain';
        return 'Cloudy';
    }

    bar(low: number, high: number) {
        const l = Math.max(0, ((low - this.wRange.min) / this.wRange.range) * 100);
        const wi = Math.max(0, Math.min(100 - l, ((high - low) / this.wRange.range) * 100));
        return `left:${l}%;width:${wi}%`;
    }
}
