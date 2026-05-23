import { fetchWithCache } from '$lib/utils/fetchWithCache';
import { ApiConfig } from '$lib/config/api';
import type { Email } from '$lib/types';

export class AppMailState {
  emails: Email[] = $state([]);
  loading = $state(true);
  selected: Email | null = $state(null);

  constructor() {}

  async fetchEmails() {
    this.loading = true;
    try {
      const data = await fetchWithCache(ApiConfig.getMailComments());
      if (data) {
        this.emails = data.map((item: any, i: number) => ({
          id: String(item.id),
          from: item.name.split(' ')[0] || item.email.split('@')[0], 
          subject: item.name,
          preview: item.body.substring(0, 50).replace(/\n/g, ' ') + '...',
          date: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`,
          read: i > 2,
          body: `Hi there,\n\n${item.body}\n\nBest regards,\n${item.email}`
        }));
      }
    } catch(e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  openEmail(email: Email) {
    this.selected = email;
    this.emails = this.emails.map(e => e.id === email.id ? { ...e, read: true } : e);
  }

  closeEmail() {
    this.selected = null;
  }
}
