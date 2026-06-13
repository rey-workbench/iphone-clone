import { Sun, CloudSun, Cloud, CloudRain, Moon } from '@lucide/svelte';

import type { IWeatherData, IWeatherRange, IWeatherHourly, IWeatherDaily, IWeatherTile } from '$lib/types';
import type { IAppLifecycle } from '$lib/types/app';
import { ApiEndpoints } from '$lib/config/api/endpoints';
import { SyncState } from '$lib/utils/SyncState.svelte';
import { settingsDb } from '$lib/config/localdb';
import { WeatherApiClient } from '$lib/client/services/WeatherApiClient';

type WeatherCache = { w: IWeatherData; wRange: IWeatherRange };

const defaultData: WeatherCache = {
    w: {
        city: 'San Francisco', temp: 18, condition: 'Partly Cloudy', high: 21, low: 13,
        hourly: [], daily: [], tiles: []
    },
    wRange: { min: 8, range: 17 }
};

export class WeatherAppState extends SyncState<WeatherCache> implements IAppLifecycle {
    appName = 'Weather';
    isForeground = $state(false);

    constructor() {
        super(settingsDb, 'app_weather', defaultData, async () => {
            let lat = 37.7749;
            let lon = -122.4194;
            let city = 'San Francisco';
            try {
                const geoData = await new Promise<{lat: number, lon: number, city: string}>((resolve, reject) => {
                    if (typeof navigator === 'undefined' || !navigator.geolocation) {
                        return reject(new Error("Geolocation not supported"));
                    }
                    navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                            const latitude = pos.coords.latitude;
                            const longitude = pos.coords.longitude;
                            let cityName = 'Current Location';
                            try {
                                cityName = await WeatherApiClient.getCityFromCoords(latitude, longitude);
                            } catch (e) { /* ignore */ }
                            resolve({ lat: latitude, lon: longitude, city: cityName });
                        },
                        (err) => reject(err),
                        { timeout: 5000, maximumAge: 60000 }
                    );
                });
                
                lat = geoData.lat;
                lon = geoData.lon;
                city = geoData.city;
            } catch (nativeError) { 
                try {
                    const ipData = await WeatherApiClient.getIpLocation();
                    if (ipData && ipData.latitude !== undefined && ipData.longitude !== undefined) {
                        lat = ipData.latitude;
                        lon = ipData.longitude;
                        city = ipData.city || city;
                    }
                } catch (ipError) { }
            }

            const data = await WeatherApiClient.getForecast(lat, lon);
            if (!data || !data.hourly || !data.daily || !data.current) {
                throw new Error("Invalid weather data");
            }
                
            let hourly: IWeatherHourly[] = [];
            for (let i = 0; i < 8; i++) {
                const timeStr = i === 0 ? 'Now' : new Date(data.hourly.time[i]).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).replace(' ', '');
                const isNight = new Date(data.hourly.time[i]).getHours() < 6 || new Date(data.hourly.time[i]).getHours() > 18;
                hourly.push({ time: timeStr, temp: Math.round(data.hourly.temperature_2m[i]), icon: WeatherAppState.getIconStatic(data.hourly.weather_code[i], isNight) });
            }

            let daily: IWeatherDaily[] = [];
            for (let i = 0; i < 7; i++) {
                const dateObj = new Date(data.daily.time[i]);
                const dayStr = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                daily.push({ day: dayStr, high: Math.round(data.daily.temperature_2m_max[i]), low: Math.round(data.daily.temperature_2m_min[i]), icon: WeatherAppState.getIconStatic(data.daily.weather_code[i]) });
            }

            const absMin = Math.min(...daily.map(d => d.low));
            const absMax = Math.max(...daily.map(d => d.high));
            const wRange = { min: absMin, range: Math.max(1, absMax - absMin) };

            const w = {
                city,
                temp: Math.round(data.current.temperature_2m),
                condition: WeatherAppState.conditionDescStatic(data.current.weather_code),
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
            
            return { w, wRange };
        });
    }

    async init() {
        await this.load();
    }

    async onLaunch() {
        this.isForeground = true;
        await this.init();
    }

    onSuspend() {
        this.isForeground = false;
    }

    onResume() {
        this.isForeground = true;
    }

    onDestroy() {
        this.isForeground = false;
    }

    get w() {
        return this.data?.w || defaultData.w;
    }

    get wRange() {
        return this.data?.wRange || defaultData.wRange;
    }

    static getIconStatic(code: number, isNight = false) {
        if (code === 0) return isNight ? Moon : Sun;
        if (code >= 1 && code <= 3) return isNight ? Cloud : CloudSun;
        if (code >= 51 && code <= 82 || code >= 95) return CloudRain;
        return Cloud;
    }

    static conditionDescStatic(code: number) {
        if (code === 0) return 'Clear';
        if (code >= 1 && code <= 3) return 'Partly Cloudy';
        if (code >= 51 && code <= 82 || code >= 95) return 'Rain';
        return 'Cloudy';
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
        return { left: l, width: wi };
    }
}
