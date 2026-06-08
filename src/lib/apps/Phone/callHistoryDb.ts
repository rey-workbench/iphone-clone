import { initLocalDB } from '$lib/config/localdb';

export type CallHistoryEntry = {
  id: string;
  contact_id: string;
  contact_name: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  duration: number;
  is_video: boolean;
};

export async function saveCallHistory(entry: CallHistoryEntry) {
  const db = await initLocalDB();
  if (!db) return;
  const rawEntry = JSON.parse(JSON.stringify(entry));
  await db.put('call_history', rawEntry);
}

export async function getCallHistory(): Promise<CallHistoryEntry[]> {
  const db = await initLocalDB();
  if (!db) return [];
  // Get all and sort by timestamp desc (since we have an index)
  const tx = db.transaction('call_history', 'readonly');
  const index = tx.store.index('timestamp');
  const all = await index.getAll();
  return all.reverse(); // Reverse so newest is first
}
