import { ApiConfig } from '$lib/config/api';

export class SystemState {
  activeApp = $state<string | null>(null);
  currentUser = $state<{ id: string, username: string, name: string } | null>(null);
  currentTime = $state<Date>(new Date());
  deviceId = $state<string>('');

  deviceName = $state<string>('Unknown Device');

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reynisa_currentUser');
      if (saved) {
        try { this.currentUser = JSON.parse(saved); } catch (e) {}
      }

      // Handle Device ID persistence
      let savedDeviceId = localStorage.getItem('reynisa_deviceId');
      if (!savedDeviceId) {
          savedDeviceId = crypto.randomUUID();
          localStorage.setItem('reynisa_deviceId', savedDeviceId);
      }
      this.deviceId = savedDeviceId;

      // Simple user agent parser for device name
      const ua = navigator.userAgent;
      let browser = 'Unknown Browser';
      if (ua.includes('Edg')) browser = 'Edge';
      else if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Firefox')) browser = 'Firefox';

      let os = 'Unknown OS';
      if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Mac OS')) os = 'macOS';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iPhone')) os = 'iPhone';

      this.deviceName = `${os} - ${browser}`;

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
