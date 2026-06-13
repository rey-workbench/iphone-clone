import { Plane, Wifi, Bluetooth, Antenna, Link, Bell, Volume2, Moon, Hourglass, Settings, Sun, LayoutGrid, Accessibility, Image, Battery, Lock } from '@lucide/svelte';
import { systemGlobalState } from '$lib/os/states';
import { settingsDb, SettingsDBKey } from '$lib/config/localdb';
import { PersistedState } from '$lib/utils/PersistedState.svelte';

type SettingsData = {
  airplaneMode: boolean;
  wifi: boolean;
  bluetooth: boolean;
  cellularData: boolean;
  batteryLevel: number;
  isCharging: boolean;
  brightness: number;
  volume: number;
  doNotDisturb: boolean;
  locationServices: boolean;
  autoBrightness: boolean;
  lowPowerMode: boolean;
};

const defaultSettings: SettingsData = {
  airplaneMode: false,
  wifi: true,
  bluetooth: true,
  cellularData: true,
  batteryLevel: 100,
  isCharging: false,
  brightness: 80,
  volume: 50,
  doNotDisturb: false,
  locationServices: true,
  autoBrightness: true,
  lowPowerMode: false
};

class SettingsGlobalState extends PersistedState<SettingsData> {
  constructor() {
    super(settingsDb, SettingsDBKey.SETTINGS, defaultSettings);
  }
}

export const settingsGlobalState = new SettingsGlobalState();

export class SettingsAppState {
  searchText = $state('');

  get profile() {
    const user = systemGlobalState.currentUser;
    if (user) {
      const initials = user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
      return { name: user.name, initials };
    }
    return { name: 'User', initials: 'U' };
  }

  general = [
    { id: 'linked_devices', icon: Link, bg: '#34C759', label: 'Linked Devices' },
    { id: 'notifications', icon: Bell, bg: '#FF3B30', label: 'Notifications' },
    { id: 'sounds', icon: Volume2, bg: '#FF2D55', label: 'Sounds & Haptics' },
    { id: 'focus', icon: Moon, bg: '#5856D6', label: 'Focus' },
    { id: 'screen_time', icon: Hourglass, bg: '#5856D6', label: 'Screen Time' },
  ];

  settings = [
    { id: 'general', icon: Settings, bg: '#8E8E93', label: 'General' },
    { id: 'display', icon: Sun, bg: '#007AFF', label: 'Display & Brightness' },
    { id: 'home_screen', icon: LayoutGrid, bg: '#007AFF', label: 'Home Screen & App Library' },
    { id: 'accessibility', icon: Accessibility, bg: '#007AFF', label: 'Accessibility' },
    { id: 'wallpaper', icon: Image, bg: '#34C759', label: 'Wallpaper' },
    { id: 'battery', icon: Battery, bg: '#34C759', label: 'Battery' },
    { id: 'privacy', icon: Lock, bg: '#007AFF', label: 'Privacy & Security' },
  ];

  constructor() { }

  toggle(id: string) {
    if (!settingsGlobalState.data) return;
    if (id === 'airplane') settingsGlobalState.data.airplaneMode = !settingsGlobalState.data.airplaneMode;
    if (id === 'wifi') settingsGlobalState.data.wifi = !settingsGlobalState.data.wifi;
    if (id === 'bluetooth') settingsGlobalState.data.bluetooth = !settingsGlobalState.data.bluetooth;
    settingsGlobalState.save();
  }

  getToggleItems(globalSettings: typeof settingsGlobalState) {
    const d = globalSettings.data || defaultSettings;
    return [
      { id: 'airplane', icon: Plane, bg: '#FF9500', label: 'Airplane Mode', toggle: true, value: d.airplaneMode },
      { id: 'wifi', icon: Wifi, bg: '#007AFF', label: 'Wi-Fi', detail: d.wifi ? 'Home' : 'Off' },
      { id: 'bluetooth', icon: Bluetooth, bg: '#007AFF', label: 'Bluetooth', detail: d.bluetooth ? 'On' : 'Off' },
      { id: 'cellular', icon: Antenna, bg: '#34C759', label: 'Cellular', detail: '' },
      { id: 'hotspot', icon: Link, bg: '#34C759', label: 'Personal Hotspot', detail: 'Off' },
    ];
  }
}
