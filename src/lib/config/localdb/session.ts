import { LocalDBAdapter } from './core';
export const sessionDb = new LocalDBAdapter('myphone_session_db', 'session');

export const SessionDBKey = {
  CURRENT_USER: 'current_user',
} as const;
