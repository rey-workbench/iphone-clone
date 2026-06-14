export interface IWeatherHourly {
  time: string;
  temp: number;
  icon: any; // Svelte component type (Lucide icon)
}

export interface IWeatherDaily {
  day: string;
  high: number;
  low: number;
  icon: any; // Svelte component type (Lucide icon)
}

export interface IWeatherTile {
  title: string;
  value: string;
  desc: string;
}

export interface IWeatherData {
  city: string;
  temp: number;
  condition: string;
  high: number;
  low: number;
  hourly: IWeatherHourly[];
  daily: IWeatherDaily[];
  tiles: IWeatherTile[];
}

export interface IWeatherRange {
  min: number;
  range: number;
}
