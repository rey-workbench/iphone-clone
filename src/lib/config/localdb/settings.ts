import { LocalDBAdapter } from './core';
export const settingsDb = new LocalDBAdapter('myphone_settings_db', 'settings');

export const SettingsDBKey = {
  SETTINGS: 'settings',
} as const;
