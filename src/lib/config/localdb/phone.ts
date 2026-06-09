import { LocalDBAdapter } from './core';
export const phoneDb = new LocalDBAdapter<CallHistoryEntry>('call_history');

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
  await phoneDb.set(entry.id, entry);
}

export async function getCallHistory(): Promise<CallHistoryEntry[]> {
  const entries = await phoneDb.getAll();
  return entries.sort((a, b) => b.timestamp - a.timestamp);
}

export async function deleteCallHistory(id: string) {
  await phoneDb.delete(id);
}

export async function clearCallHistory() {
  await phoneDb.clear();
}
