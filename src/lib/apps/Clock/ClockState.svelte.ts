import { BaseState } from '$lib/states/BaseState.svelte';
import type { Alarm } from '$lib/types';

export class ClockState extends BaseState<any> {
  activeTab = $state<'worldClock' | 'alarm' | 'stopwatch' | 'timer'>('worldClock');
  stopwatchRunning = $state(false);
  stopwatchTime = $state(0);
  timerRunning = $state(false);
  timerDuration = $state(300);
  timerRemaining = $state(300);
  alarms = $state<Alarm[]>([]);

  constructor() {
    super('appClock');
    if (typeof window !== 'undefined') {
      this.loadClock();
    }
  }

  async loadClock() {
    const defaultClock = {
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
    const data = await this.loadFromDb(defaultClock);
    this.activeTab = data.activeTab || 'worldClock';
    this.stopwatchRunning = data.stopwatchRunning || false;
    this.stopwatchTime = data.stopwatchTime || 0;
    this.timerRunning = data.timerRunning || false;
    this.timerDuration = data.timerDuration || 300;
    this.timerRemaining = data.timerRemaining || 300;
    this.alarms = data.alarms || defaultClock.alarms;
  }

  save() {
    if (typeof window !== 'undefined') {
      const data = {
        activeTab: this.activeTab,
        stopwatchRunning: this.stopwatchRunning,
        stopwatchTime: this.stopwatchTime,
        timerRunning: this.timerRunning,
        timerDuration: this.timerDuration,
        timerRemaining: this.timerRemaining,
        alarms: $state.snapshot(this.alarms)
      };
      this.saveToDb(data);
    }
  }

  toggleAlarm(id: string) {
    const alarm = this.alarms.find(a => a.id === id);
    if (alarm) {
      alarm.enabled = !alarm.enabled;
      this.save();
    }
  }
}

export const clockState = new ClockState();
