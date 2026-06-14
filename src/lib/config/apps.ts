import type { IAppConfig } from '$lib/types';

// Map app IDs to real icon filenames
const I = (f: string) => `/assets/icons/${f}`;

export const homeScreenApps: IAppConfig[][] = [
  [
    { id: 'weather', name: 'Weather', icon: I('com.apple.weather-large.png'), color: '#48A5F1', gradient: 'linear-gradient(180deg,#48A5F1,#1B6FC2)' },
    { id: 'clock', name: 'Clock', icon: I('com.apple.mobiletimer-large.png'), color: '#000', gradient: 'linear-gradient(180deg,#1C1C1E,#000)' },
    { id: 'calculator', name: 'Calculator', icon: I('com.apple.calculator-large.png'), color: '#65686E', gradient: 'linear-gradient(180deg,#6B6B70,#333)' },
    { id: 'notes', name: 'Notes', icon: I('com.apple.mobilenotes-large.png'), color: '#FFD60A', gradient: 'linear-gradient(180deg,#FFD60A,#FFAB00)' },
    { id: 'calendar', name: 'Calendar', icon: I('com.apple.mobilecal-large.png'), color: '#FFF', gradient: 'linear-gradient(180deg,#FFF,#F2F2F7)' },
    { id: 'photos', name: 'Photos', icon: I('com.apple.mobileslideshow-large.png'), color: '#FFF', gradient: 'linear-gradient(180deg,#FFF,#F2F2F7)' },
    { id: 'camera', name: 'Camera', icon: I('com.apple.camera-large.png'), color: '#65686E', gradient: 'linear-gradient(180deg,#6B6B70,#333)' },
    { id: 'settings', name: 'Settings', icon: I('com.apple.Preferences-large.png'), color: '#8E8E93', gradient: 'linear-gradient(180deg,#8E8E93,#636366)' },
    { id: 'music', name: 'Music', icon: I('com.apple.Music-large.png'), color: '#FC3C44', gradient: 'linear-gradient(180deg,#FC3C44,#D92D38)' },
    { id: 'appstore', name: 'App Store', icon: I('com.apple.AppStore-large.png'), color: '#007AFF', gradient: 'linear-gradient(180deg,#007AFF,#0051D5)' },
    { id: 'messages', name: 'Messages', icon: I('com.apple.MobileSMS-large.png'), color: '#34C759', gradient: 'linear-gradient(180deg,#65D36E,#248A3D)' },
    { id: 'mail', name: 'Mail', icon: I('com.apple.mobilemail-large.png'), color: '#007AFF', gradient: 'linear-gradient(180deg,#007AFF,#0051D5)' },
    { id: 'netflix', name: 'Netflix', icon: I('netflix.png'), color: '#E50914', gradient: 'linear-gradient(180deg,#E50914,#831010)', customIconClass: 'scale-[1.3]', customContainerClass: 'bg-black border-none' },
  ],
  [
    { id: 'maps', name: 'Maps', icon: I('com.apple.Maps-large.png'), color: '#34C759', gradient: 'linear-gradient(135deg,#34C759,#248A3D)' },
    { id: 'safari', name: 'Safari', icon: I('com.apple.mobilesafari-large.png'), color: '#007AFF', gradient: 'linear-gradient(180deg,#409CFF,#0051D5)' },
    { id: 'facetime', name: 'FaceTime', icon: I('com.apple.facetime-large.png'), color: '#34C759', gradient: 'linear-gradient(180deg,#34C759,#248A3D)' },
    { id: 'health', name: 'Health', icon: I('com.apple.Health-large.png'), color: '#FF375F', gradient: 'linear-gradient(180deg,#FF375F,#D92D38)' },
    { id: 'wallet', name: 'Wallet', icon: I('com.apple.Passbook-large.png'), color: '#000', gradient: 'linear-gradient(180deg,#1C1C1E,#000)' },
    { id: 'files', name: 'Files', icon: I('com.apple.DocumentsApp-large.png'), color: '#007AFF', gradient: 'linear-gradient(180deg,#409CFF,#0051D5)' },
    { id: 'tips', name: 'Tips', icon: I('com.apple.tips-large.png'), color: '#FFD60A', gradient: 'linear-gradient(180deg,#FFD60A,#FFAB00)' },
    { id: 'fitness', name: 'Fitness', icon: I('com.apple.Fitness-large.png'), color: '#30D158', gradient: 'linear-gradient(180deg,#30D158,#248A3D)' },
  ]
];

export const dockApps: IAppConfig[] = [
  { id: 'phone', name: 'Phone', icon: I('com.apple.mobilephone-large.png'), color: '#34C759', gradient: 'linear-gradient(180deg,#65D36E,#248A3D)' },
  { id: 'safari', name: 'Safari', icon: I('com.apple.mobilesafari-large.png'), color: '#007AFF', gradient: 'linear-gradient(180deg,#409CFF,#0051D5)' },
  { id: 'messages', name: 'Messages', icon: I('com.apple.MobileSMS-large.png'), color: '#34C759', gradient: 'linear-gradient(180deg,#65D36E,#248A3D)' },
  { id: 'music', name: 'Music', icon: I('com.apple.Music-large.png'), color: '#FC3C44', gradient: 'linear-gradient(180deg,#FC3C44,#D92D38)' },
];

export const implementedApps = new Set([
  'weather', 'calculator', 'settings', 'clock', 'notes',
  'phone', 'messages', 'music', 'calendar', 'photos',
  'safari', 'camera', 'mail', 'appstore', 'netflix'
]);
