export interface WeatherHourly {
  time: string;
  temp: number;
  icon: any; // Svelte component type (Lucide icon)
}

export interface WeatherDaily {
  day: string;
  high: number;
  low: number;
  icon: any; // Svelte component type (Lucide icon)
}

export interface WeatherTile {
  title: string;
  value: string;
  desc: string;
}

export interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  high: number;
  low: number;
  hourly: WeatherHourly[];
  daily: WeatherDaily[];
  tiles: WeatherTile[];
}

export interface WeatherRange {
  min: number;
  range: number;
}
