import { LocalDBAdapter } from './core';
export const userDb = new LocalDBAdapter('myphone_user_db', 'users');

export const UserDBKey = {
  USERS_LIST: 'users_list',
  USERS: 'users',
} as const;
