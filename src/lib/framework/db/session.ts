import { LocalDBAdapter } from './core';
export const sessionDb = new LocalDBAdapter('session');

export const SessionDBKey = {
	CURRENT_USER: 'current_user'
} as const;
