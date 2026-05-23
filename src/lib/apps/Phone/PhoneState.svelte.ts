import type { PhoneTabId } from '$lib/types';

export class PhoneState {
    tab = $state<PhoneTabId>('keypad');
    dialNumber = $state('');

    recents = [
        { name: 'Tim Cook', time: 'Today, 2:34 PM', missed: false },
        { name: 'Craig Federighi', time: 'Today, 11:20 AM', missed: true },
        { name: 'Jony Ive', time: 'Yesterday, 5:15 PM', missed: false },
        { name: 'Phil Schiller', time: 'Yesterday, 3:00 PM', missed: false },
        { name: 'Steve Jobs', time: '2 days ago', missed: true },
    ];

    contacts = [
        { name: 'Craig Federighi', phone: '+1 (555) 234-5678' },
        { name: 'Jony Ive', phone: '+1 (555) 345-6789' },
        { name: 'Phil Schiller', phone: '+1 (555) 456-7890' },
        { name: 'Tim Cook', phone: '+1 (555) 567-8901' },
    ];

    keys = [
        [{ n: '1', s: '' }, { n: '2', s: 'ABC' }, { n: '3', s: 'DEF' }],
        [{ n: '4', s: 'GHI' }, { n: '5', s: 'JKL' }, { n: '6', s: 'MNO' }],
        [{ n: '7', s: 'PQRS' }, { n: '8', s: 'TUV' }, { n: '9', s: 'WXYZ' }],
        [{ n: '*', s: '' }, { n: '0', s: '+' }, { n: '#', s: '' }],
    ];

    constructor() {}

    appendNumber(n: string) {
        this.dialNumber += n;
    }

    backspace() {
        this.dialNumber = this.dialNumber.slice(0, -1);
    }
}
