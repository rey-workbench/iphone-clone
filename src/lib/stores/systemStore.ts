import { writable } from 'svelte/store';

export const activeApp = writable<string | null>(null);

export const currentUser = writable<{ id: string, username: string, name: string } | null>(null);

function createTimeStore() {
  const { subscribe, set } = writable(new Date());
  if (typeof window !== 'undefined') {
    setInterval(() => set(new Date()), 1000);
  }
  return { subscribe };
}

export const currentTime = createTimeStore();

// Setup Supabase Keepalive Ping
if (typeof window !== 'undefined') {
  // Ping immediately on boot
  fetch('/api/keepalive').catch(() => {});
  // Then ping every 30 minutes (1800000 ms)
  setInterval(() => {
    fetch('/api/keepalive').catch(() => {});
  }, 30 * 60 * 1000);
}
