import { writable } from 'svelte/store';

export const activeApp = writable<string | null>(null);

function createTimeStore() {
  const { subscribe, set } = writable(new Date());
  if (typeof window !== 'undefined') {
    setInterval(() => set(new Date()), 1000);
  }
  return { subscribe };
}

export const currentTime = createTimeStore();
