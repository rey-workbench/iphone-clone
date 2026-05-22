import { writable } from 'svelte/store';
import { getClockState, setClockState } from '$lib/localdb/index';

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
