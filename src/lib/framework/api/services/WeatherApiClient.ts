import { ApiConfig } from '$lib/framework/api/api';
import { fetchWithCache } from '$lib/framework/utils/fetchWithCache';

export class WeatherApiClient {
	static async getCityFromCoords(lat: number, lon: number): Promise<string> {
		const res = await fetch(
			`${ApiConfig.NOMINATIM_REVERSE}?format=json&lat=${lat}&lon=${lon}&zoom=10`
		);
		const data = await res.json();
		return (
			data.address?.city ||
			data.address?.town ||
			data.address?.village ||
			data.address?.county ||
			'Current Location'
		);
	}

	static async getIpLocation(): Promise<{ latitude: number; longitude: number; city: string }> {
		const providers = ApiConfig.WEATHER_IP_PROVIDERS;

		for (const url of providers) {
			try {
				// Refresh cache every 10 seconds (10000 ms)
				const data = await fetchWithCache<any>(url, undefined, 10000);
				if (!data || data.error || data.success === false || data.status === 'fail') continue;

				let lat = data.latitude !== undefined ? data.latitude : data.lat;
				let lon = data.longitude !== undefined ? data.longitude : data.lon;
				const city = data.city || data.cityName;

				if (typeof lat === 'string') lat = parseFloat(lat);
				if (typeof lon === 'string') lon = parseFloat(lon);

				if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
					return { latitude: lat, longitude: lon, city: city || 'Unknown' };
				}
			} catch {
				// Failed to fetch IP from this provider
			}
		}
		throw new Error('All IP geolocation providers failed');
	}

	static async getForecast(
		lat: number,
		lon: number
	): Promise<{ current: any; hourly: any; daily: any }> {
		const url = `${ApiConfig.WEATHER_FORECAST}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,surface_pressure,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
		return await fetchWithCache<any>(url);
	}
}
