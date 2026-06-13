import type { TPhoneTabId } from '$lib/types';
import { usersGlobalState } from '$lib/os/states';

export class PhoneAppState {
    tab = $state<TPhoneTabId>('keypad');
    dialNumber = $state('');

    recents: any[] = $state([]);
    loadingRecents = $state(true);

    contacts: any[] = $state([]);
    loadingContacts = $state(true);

    keys = [
        [{ n: '1', s: '' }, { n: '2', s: 'ABC' }, { n: '3', s: 'DEF' }],
        [{ n: '4', s: 'GHI' }, { n: '5', s: 'JKL' }, { n: '6', s: 'MNO' }],
        [{ n: '7', s: 'PQRS' }, { n: '8', s: 'TUV' }, { n: '9', s: 'WXYZ' }],
        [{ n: '*', s: '' }, { n: '0', s: '+' }, { n: '#', s: '' }],
    ];

    constructor() {
        usersGlobalState.fetchUsers((users) => this.updateContacts(users));
        this.loadRecents();
        if (typeof window !== 'undefined') {
            window.addEventListener('reynisa:call_ended', () => this.loadRecents());
        }
    }

    async loadRecents() {
        this.loadingRecents = true;
        const { getCallHistory } = await import('$lib/config/localdb');
        const history = await getCallHistory();
        
        const now = new Date();
        const isToday = (d: Date) => d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        const isYesterday = (d: Date) => {
            const y = new Date(now);
            y.setDate(y.getDate() - 1);
            return d.getDate() === y.getDate() && d.getMonth() === y.getMonth() && d.getFullYear() === y.getFullYear();
        };

        this.recents = history.map(entry => {
            const d = new Date(entry.timestamp);
            let timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (isToday(d)) {
                // timeStr = timeStr;
            } else if (isYesterday(d)) {
                timeStr = 'Yesterday';
            } else {
                timeStr = d.toLocaleDateString();
            }

            return {
                id: entry.id,
                name: entry.contact_name,
                time: timeStr,
                type: entry.type,
                isVideo: entry.is_video,
                missed: entry.type === 'missed'
            };
        });
        this.loadingRecents = false;
    }

    updateContacts(users: any[]) {
        this.contacts = users.map(u => {
            const displayName = u.name || u.username || 'Unknown';
            return {
                id: u.id,
                name: displayName,
                username: u.username || displayName,
                initials: displayName.substring(0, 2).toUpperCase(),
            };
        });
        this.loadingContacts = false;
    }

    appendNumber(n: string) {
        this.dialNumber += n;
    }

    backspace() {
        this.dialNumber = this.dialNumber.slice(0, -1);
    }
}
