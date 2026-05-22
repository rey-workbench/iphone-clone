import { writable } from 'svelte/store';

// Currently active app (null = home screen)
export const activeApp = writable<string | null>(null);

// Settings state
export const settingsState = writable({
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
});

// Time store — updates every second
function createTimeStore() {
  const { subscribe, set } = writable(new Date());
  
  if (typeof window !== 'undefined') {
    setInterval(() => set(new Date()), 1000);
  }
  
  return { subscribe };
}

export const currentTime = createTimeStore();

// Calculator state
export const calculatorState = writable({
  display: '0',
  previousValue: null as number | null,
  operation: null as string | null,
  waitingForOperand: false,
  shouldClear: false,
});

// Notes state
export interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
}

export const notesState = writable<Note[]>([
  { id: '1', title: 'Welcome to Notes', content: 'This is a sample note in your iOS 26 clone.', date: new Date() },
  { id: '2', title: 'Shopping List', content: '• Apples\n• Bread\n• Milk\n• Coffee', date: new Date(Date.now() - 86400000) },
  { id: '3', title: 'Ideas', content: 'Build something amazing with SvelteKit!', date: new Date(Date.now() - 172800000) },
]);

// Clock state
export const clockState = writable({
  activeTab: 'worldClock' as 'worldClock' | 'alarm' | 'stopwatch' | 'timer',
  stopwatchRunning: false,
  stopwatchTime: 0,
  timerRunning: false,
  timerDuration: 300,
  timerRemaining: 300,
  alarms: [
    { id: '1', time: '06:30', label: 'Wake Up', enabled: true, days: 'Weekdays' },
    { id: '2', time: '08:00', label: 'Meeting', enabled: false, days: 'Every Day' },
    { id: '3', time: '22:00', label: 'Bedtime', enabled: true, days: 'Weekdays' },
  ]
});
