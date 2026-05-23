import { 
    Plane, Wifi, Bluetooth, Antenna, Link, 
    Bell, Volume2, Moon, Hourglass, Settings, Sun, 
    LayoutGrid, Accessibility, Image, Battery, Lock 
} from '@lucide/svelte';
import { BaseState } from '$lib/states/BaseState.svelte';
import { LocalDBKey } from '$lib/config/localdb';

export class SettingsState extends BaseState<any> {
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

  constructor() {
    super(LocalDBKey.SETTINGS);
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  async loadSettings() {
    const defaultSettings = {
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
    const data = await this.loadFromDb(defaultSettings);
    Object.assign(this, data);
  }

  save() {
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
      this.saveToDb(data);
    }
  }
}

export const settingsState = new SettingsState();

export class AppSettingsState {
    searchText = $state('');
    
    profile = { name: 'John Appleseed', initials: 'JA' };

    general = [
        { icon: Bell, bg: '#FF3B30', label: 'Notifications' },
        { icon: Volume2, bg: '#FF2D55', label: 'Sounds & Haptics' },
        { icon: Moon, bg: '#5856D6', label: 'Focus' },
        { icon: Hourglass, bg: '#5856D6', label: 'Screen Time' },
    ];

    settings = [
        { icon: Settings, bg: '#8E8E93', label: 'General' },
        { icon: Sun, bg: '#007AFF', label: 'Display & Brightness' },
        { icon: LayoutGrid, bg: '#007AFF', label: 'Home Screen & App Library' },
        { icon: Accessibility, bg: '#007AFF', label: 'Accessibility' },
        { icon: Image, bg: '#34C759', label: 'Wallpaper' },
        { icon: Battery, bg: '#34C759', label: 'Battery' },
        { icon: Lock, bg: '#007AFF', label: 'Privacy & Security' },
    ];

    constructor() {}

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
