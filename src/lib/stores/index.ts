import { writable } from 'svelte/store';
import { getSetting, setSetting, getClockState, setClockState } from '$lib/localdb/index';

export const activeApp = writable<string | null>(null);

function createTimeStore() {
  const { subscribe, set } = writable(new Date());
  if (typeof window !== 'undefined') {
    setInterval(() => set(new Date()), 1000);
  }
  return { subscribe };
}

export const currentTime = createTimeStore();

export const calculatorState = writable({
  display: '0',
  previousValue: null as number | null,
  operation: null as string | null,
  waitingForOperand: false,
  shouldClear: false,
});

// ==========================================
// Settings Store (Synced with sql.js)
// ==========================================
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

// ==========================================
// Clock Store (Synced with sql.js)
// ==========================================
const defaultClock = {
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
};

function createClockStore() {
  const { subscribe, set, update } = writable(defaultClock);

  if (typeof window !== 'undefined') {
    getClockState('appClock', defaultClock).then((data) => {
      set(data);
    });
  }

  return {
    subscribe,
    set: (value: typeof defaultClock) => {
      set(value);
      if (typeof window !== 'undefined') setClockState('appClock', value);
    },
    update: (updater: (val: typeof defaultClock) => typeof defaultClock) => {
      update((current) => {
        const newValue = updater(current);
        if (typeof window !== 'undefined') setClockState('appClock', newValue);
        return newValue;
      });
    }
  };
}

export const clockState = createClockStore();

// ==========================================
// Notes Store (Synced with Turso Cloud DB)
// ==========================================
export interface Note {
  id: string;
  title: string;
  content: string;
  date: Date;
}

const defaultNotes: Note[] = [
  { id: '1', title: 'Welcome to Notes', content: 'This is a sample note in your iOS 26 clone.', date: new Date() },
];

function createNotesStore() {
  const { subscribe, set, update } = writable<Note[]>(defaultNotes);

  if (typeof window !== 'undefined') {
    fetch('/api/notes').then(r => r.json()).then(data => {
      if (data.success && data.notes && data.notes.length > 0) {
        set(data.notes.map((n: any) => ({ ...n, date: new Date(n.date) })));
      }
    }).catch(console.error);
  }

  return {
    subscribe,
    set,
    update,
    addNote: async (note: Note) => {
      update(n => [note, ...n]);
      await fetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify(note)
      }).catch(console.error);
    },
    updateNote: async (note: Note) => {
      update(notes => notes.map(n => n.id === note.id ? note : n));
      await fetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify(note)
      }).catch(console.error);
    },
    deleteNote: async (id: string) => {
      update(notes => notes.filter(n => n.id !== id));
      await fetch('/api/notes', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      }).catch(console.error);
    }
  };
}

export const notesState = createNotesStore();
