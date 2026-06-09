import { LocalDBAdapter } from './core';
export const mailDb = new LocalDBAdapter('mail');

export const MailDBKey = {
  MAIL_INBOX: 'mail_inbox',
} as const;
