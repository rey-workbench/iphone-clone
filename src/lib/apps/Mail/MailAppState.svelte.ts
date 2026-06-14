import { mailDb, MailDBKey } from '$lib/config/localdb';
import { SyncState } from '$lib/utils/SyncState.svelte';

import type { IEmail } from '$lib/types';

export class MailAppState extends SyncState<IEmail[]> {
  selected: IEmail | null = $state(null);

  constructor() {
    super(mailDb, MailDBKey.MAIL_INBOX, [], async () => {
      const { MailApiClient } = await import('$lib/client/services/MailApiClient');
      const data = await MailApiClient.getComments();
      if (data && Array.isArray(data)) {
        return data.map((item: {id: number, name: string, email: string, body: string}, i: number) => ({
          id: String(item.id),
          from: item.name.split(' ')[0] || item.email.split('@')[0], 
          subject: item.name,
          preview: item.body.substring(0, 50).replace(/\n/g, ' ') + '...',
          date: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`,
          read: i > 2,
          body: `Hi there,\n\n${item.body}\n\nBest regards,\n${item.email}`
        }));
      }
      return [];
    });
  }

  // Backward compatibility wrapper for older components calling fetchEmails
  async fetchEmails() {
    await this.load();
  }

  // Getters for UI backward compatibility
  get emails() {
    return this.data || [];
  }

  openEmail(email: IEmail) {
    this.selected = email;
    // Mutate state without remote action since it's just marking read locally
    if (this.data) {
      this.data = this.data.map(e => e.id === email.id ? { ...e, read: true } : e);
      this.saveCache();
    }
  }

  closeEmail() {
    this.selected = null;
  }
}
