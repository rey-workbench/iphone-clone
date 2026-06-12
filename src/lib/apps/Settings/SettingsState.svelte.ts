import { Plane, Wifi, Bluetooth, Antenna, Link, Bell, Volume2, Moon, Hourglass, Settings, Sun, LayoutGrid, Accessibility, Image, Battery, Lock } from '@lucide/svelte';
import { systemState } from '$lib/states';
import { settingsDb, SettingsDBKey } from '$lib/config/localdb';

class SettingsState {
  airplaneMode = $state(false);
  wifi = $state(true);
  bluetooth = $state(true);
  cellularData = $state(true);
  batteryLevel = $state(100);
  isCharging = $state(false);
  brightness = $state(80);
  volume = $state(50);
  doNotDisturb = $state(false);
  locationServices = $state(true);
  autoBrightness = $state(true);
  lowPowerMode = $state(false);

  isLoading = $state(false);

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  async init() {
    this.isLoading = true;
    try {
      const data = await settingsDb.get(SettingsDBKey.SETTINGS, {
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
      });
      Object.assign(this, data);
      this.isLoading = false;
    } catch (e) {
      this.isLoading = false;
    }
  }

  async save() {
    if (typeof window !== 'undefined') {
      const data = {
        airplaneMode: this.airplaneMode,
        wifi: this.wifi,
        bluetooth: this.bluetooth,
        cellularData: this.cellularData,
        batteryLevel: this.batteryLevel,
        isCharging: this.isCharging,
        brightness: this.brightness,
        volume: this.volume,
        doNotDisturb: this.doNotDisturb,
        locationServices: this.locationServices,
        autoBrightness: this.autoBrightness,
        lowPowerMode: this.lowPowerMode
      };
      await settingsDb.set(SettingsDBKey.SETTINGS, data);
    }
  }
}

export const settingsState = new SettingsState();

export class AppSettingsState {
  searchText = $state('');

  get profile() {
    const user = systemState.currentUser;
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
    if (id === 'airplane') settingsState.airplaneMode = !settingsState.airplaneMode;
    if (id === 'wifi') settingsState.wifi = !settingsState.wifi;
    if (id === 'bluetooth') settingsState.bluetooth = !settingsState.bluetooth;
    settingsState.save();
  }

  // Since these derived values depend on global store, we provide a getter or return it explicitly in UI
  getToggleItems(globalSettings: any) {
    return [
      { id: 'airplane', icon: Plane, bg: '#FF9500', label: 'Airplane Mode', toggle: true, value: globalSettings.airplaneMode },
      { id: 'wifi', icon: Wifi, bg: '#007AFF', label: 'Wi-Fi', detail: globalSettings.wifi ? 'Home' : 'Off' },
      { id: 'bluetooth', icon: Bluetooth, bg: '#007AFF', label: 'Bluetooth', detail: globalSettings.bluetooth ? 'On' : 'Off' },
      { id: 'cellular', icon: Antenna, bg: '#34C759', label: 'Cellular', detail: '' },
      { id: 'hotspot', icon: Link, bg: '#34C759', label: 'Personal Hotspot', detail: 'Off' },
    ];
  }
}
