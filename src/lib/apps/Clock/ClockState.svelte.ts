import type { Alarm } from '$lib/types';
import { settingsDb } from '$lib/config/localdb';
import { PersistedState } from '$lib/utils/PersistedState.svelte';

type ClockData = {
  activeTab: 'worldClock' | 'alarm' | 'stopwatch' | 'timer';
  stopwatchRunning: boolean;
  stopwatchTime: number;
  timerRunning: boolean;
  timerDuration: number;
  timerRemaining: number;
  alarms: Alarm[];
};

const defaultClock: ClockData = {
  activeTab: 'worldClock',
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

class ClockState extends PersistedState<ClockData> {
  constructor() {
    super(settingsDb, 'app_clock', defaultClock);
  }

  toggleAlarm(id: string) {
    if (!this.data) return;
    const alarm = this.data.alarms.find((a: Alarm) => a.id === id);
    if (alarm) {
      alarm.enabled = !alarm.enabled;
      this.save();
    }
  }
}

export const clockState = new ClockState();
