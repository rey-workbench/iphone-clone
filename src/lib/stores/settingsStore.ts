import { writable } from 'svelte/store';
import { getSetting, setSetting } from '$lib/localdb/index';

const defaultSettings = {
  airplaneMode: false,
  wifiEnabled: true,
  bluetoothEnabled: true,
  cellularEnabled: true,
  brightness: 0.75,
  volume: 0.5,
  darkMode: true,
  notifications: true,
  batteryLevel: 87,
  batteryCharging: false,
};

function createSettingsStore() {
  const { subscribe, set, update } = writable(defaultSettings);

  if (typeof window !== 'undefined') {
    getSetting('appSettings', defaultSettings).then((data) => {
      set(data);
    });
  }

  return {
    subscribe,
    set: (value: typeof defaultSettings) => {
      set(value);
      if (typeof window !== 'undefined') setSetting('appSettings', value);
    },
    update: (updater: (val: typeof defaultSettings) => typeof defaultSettings) => {
      update((current) => {
        const newValue = updater(current);
        if (typeof window !== 'undefined') setSetting('appSettings', newValue);
        return newValue;
      });
    }
  };
}

export const settingsState = createSettingsStore();
