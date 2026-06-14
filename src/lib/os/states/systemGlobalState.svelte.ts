import { SystemApiClient } from '$lib/client/services/SystemApiClient';
import { sessionDb, SessionDBKey } from '$lib/config/localdb';
import type { ISystemGlobalState, ISystemCurrentUser } from '$lib/types/os';

class SystemGlobalState implements ISystemGlobalState {
  // --- State ---
  recentApps = $state<string[]>([]);
  currentUser = $state<ISystemCurrentUser | null>(null);
  currentTime = $state<Date>(new Date());
  deviceId = $state<string>('');
  deviceName = $state<string>('Unknown Device');
  isInitializing = $state(true);

  // --- Methods ---
  removeRecentApp(appId: string) {
    this.recentApps = this.recentApps.filter(id => id !== appId);
    this.saveRecentApps();
  }

  addRecentApp(appId: string) {
    this.recentApps = this.recentApps.filter(id => id !== appId);
    this.recentApps.unshift(appId);
    if (this.recentApps.length > 10) {
      this.recentApps.pop();
    }
    this.saveRecentApps();
  }

  async saveRecentApps() {
    if (typeof window !== 'undefined') {
      await sessionDb.set('RECENT_APPS', $state.snapshot(this.recentApps));
    }
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();

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
      SystemApiClient.sendKeepalivePing();
      setInterval(() => {
        SystemApiClient.sendKeepalivePing();
      }, 30 * 60 * 1000);
    }
  }

  async init() {
    try {
      this.currentUser = (await sessionDb.get(SessionDBKey.CURRENT_USER, null)) as { id: string; username: string; name: string } | null;
      this.recentApps = (await sessionDb.get('RECENT_APPS', [])) as string[];

      let devId = (await sessionDb.get('device_id', null)) as string | null;
      if (!devId) {
        devId = crypto.randomUUID();
        await sessionDb.set('device_id', devId);
      }
      this.deviceId = devId;
    } finally {
      this.isInitializing = false;
    }
  }

  async saveUser() {
    if (typeof window !== 'undefined') {
      if (this.currentUser) {
        const snap = $state.snapshot(this.currentUser);
        await sessionDb.set(SessionDBKey.CURRENT_USER, snap);
      } else {
        await sessionDb.set(SessionDBKey.CURRENT_USER, undefined);
      }
    }
  }
}

export const systemGlobalState = new SystemGlobalState();
