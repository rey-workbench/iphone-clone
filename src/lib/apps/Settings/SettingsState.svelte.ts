import { settingsState } from '$lib/stores';
import { 
    ChevronRight, Plane, Wifi, Bluetooth, Antenna, Link, 
    Bell, Volume2, Moon, Hourglass, Settings, Sun, 
    LayoutGrid, Accessibility, Image, Battery, Lock 
} from '@lucide/svelte';

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
        settingsState.update(s => {
            if (id === 'airplane') s.airplaneMode = !s.airplaneMode;
            if (id === 'wifi') s.wifiEnabled = !s.wifiEnabled;
            if (id === 'bluetooth') s.bluetoothEnabled = !s.bluetoothEnabled;
            return s;
        });
    }

    // Since these derived values depend on global store, we provide a getter or return it explicitly in UI
    getToggleItems(globalSettings: any) {
        return [
            { id: 'airplane', icon: Plane, bg: '#FF9500', label: 'Airplane Mode', toggle: true, value: globalSettings.airplaneMode },
            { id: 'wifi', icon: Wifi, bg: '#007AFF', label: 'Wi-Fi', detail: globalSettings.wifiEnabled ? 'Home' : 'Off' },
            { id: 'bluetooth', icon: Bluetooth, bg: '#007AFF', label: 'Bluetooth', detail: globalSettings.bluetoothEnabled ? 'On' : 'Off' },
            { id: 'cellular', icon: Antenna, bg: '#34C759', label: 'Cellular', detail: '' },
            { id: 'hotspot', icon: Link, bg: '#34C759', label: 'Personal Hotspot', detail: 'Off' },
        ];
    }
}
