import { writable } from 'svelte/store';

export const activeApp = writable<string | null>(null);

function createPersistedUserStore() {
  let initial = null;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('reynisa_currentUser');
    if (saved) {
      try { initial = JSON.parse(saved); } catch (e) {}
    }
  }
  const store = writable<{ id: string, username: string, name: string } | null>(initial);
  if (typeof window !== 'undefined') {
    store.subscribe(val => {
      if (val) localStorage.setItem('reynisa_currentUser', JSON.stringify(val));
      else localStorage.removeItem('reynisa_currentUser');
    });
  }
  return store;
}

export const currentUser = createPersistedUserStore();
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
