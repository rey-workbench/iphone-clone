import { LocalDBAdapter } from './core';
export const settingsDb = new LocalDBAdapter('settings');

export const SettingsDBKey = {
	SETTINGS: 'settings'
} as const;
