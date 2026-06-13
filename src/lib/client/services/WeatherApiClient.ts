import { ApiConfig } from '$lib/config/api';
import { ApiEndpoints } from '$lib/config/api/endpoints';

export class WeatherApiClient {
    static async getCityFromCoords(lat: number, lon: number): Promise<string> {
        const res = await fetch(`${ApiEndpoints.NOMINATIM_REVERSE}?format=json&lat=${lat}&lon=${lon}&zoom=10`);
        const data = await res.json();
        return data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Current Location';
    }

    static async getIpLocation() {
        return await ApiConfig.fetchWeatherIP();
    }

    static async getForecast(lat: number, lon: number) {
        return await ApiConfig.fetchWeatherForecast(lat, lon);
    }
}
