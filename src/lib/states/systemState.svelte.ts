import { ApiConfig } from '$lib/config/api';

export class SystemState {
  activeApp = $state<string | null>(null);
  currentUser = $state<{ id: string, username: string, name: string } | null>(null);
  currentTime = $state<Date>(new Date());

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reynisa_currentUser');
      if (saved) {
        try { this.currentUser = JSON.parse(saved); } catch (e) {}
      }

      // Time updater
      setInterval(() => {
        this.currentTime = new Date();
      }, 1000);

      // Keepalive ping
      fetch(ApiConfig.SYSTEM_KEEPALIVE).catch(() => {});
      setInterval(() => {
        fetch(ApiConfig.SYSTEM_KEEPALIVE).catch(() => {});
      }, 30 * 60 * 1000);
    }
  }

  saveUser() {
    if (typeof window !== 'undefined') {
      if (this.currentUser) {
        localStorage.setItem('reynisa_currentUser', JSON.stringify($state.snapshot(this.currentUser)));
      } else {
        localStorage.removeItem('reynisa_currentUser');
      }
    }
  }
}

export const systemState = new SystemState();
