import type { Component } from 'svelte';

export interface IWeatherHourly {
	time: string;
	temp: number;
	icon: Component<any>;
}

export interface IWeatherDaily {
	day: string;
	high: number;
	low: number;
	icon: Component<any>;
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
export interface IWeatherLocation {
	id: string;
	name: string;
	country: string;
	lat: number;
	lon: number;
}
