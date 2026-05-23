import type { PhoneTabId } from '$lib/types';
import { usersState } from '$lib/states';

export class PhoneState {
    tab = $state<PhoneTabId>('keypad');
    dialNumber = $state('');

    recents: any[] = $state([]);

    contacts: any[] = $state([]);

    keys = [
        [{ n: '1', s: '' }, { n: '2', s: 'ABC' }, { n: '3', s: 'DEF' }],
        [{ n: '4', s: 'GHI' }, { n: '5', s: 'JKL' }, { n: '6', s: 'MNO' }],
        [{ n: '7', s: 'PQRS' }, { n: '8', s: 'TUV' }, { n: '9', s: 'WXYZ' }],
        [{ n: '*', s: '' }, { n: '0', s: '+' }, { n: '#', s: '' }],
    ];

    constructor() {
        usersState.fetchUsers((users) => this.updateContacts(users));
    }

    updateContacts(users: any[]) {
        this.contacts = users.map(u => ({
            id: u.id,
            name: u.name,
            username: u.username,
            initials: u.name.substring(0, 2).toUpperCase(),
        }));

        // Isi recents dengan user pertama yang ada sebagai demo
        if (this.recents.length === 0 && users.length > 0) {
            this.recents = users.map((u, i) => ({
                name: u.name,
                time: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`,
                missed: i % 2 !== 0,
            }));
        }
    }

    appendNumber(n: string) {
        this.dialNumber += n;
    }

    backspace() {
        this.dialNumber = this.dialNumber.slice(0, -1);
    }
}
