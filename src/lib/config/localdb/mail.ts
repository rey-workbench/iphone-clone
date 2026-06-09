import { LocalDBAdapter } from './core';
export const mailDb = new LocalDBAdapter('myphone_mail_db', 'mail');

export const MailDBKey = {
  MAIL_INBOX: 'mail_inbox',
} as const;
