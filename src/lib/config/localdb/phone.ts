import { LocalDBAdapter } from './core';
export const phoneDb = new LocalDBAdapter('myphone_phone_db', 'call_history');

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
  const db = await phoneDb.init();
  if (!db) return [];
  const entries = await db.getAll('call_history') as CallHistoryEntry[];
  return entries.sort((a, b) => b.timestamp - a.timestamp);
}
