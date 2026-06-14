import type { IBtn } from '$lib/types';

export class CalculatorAppState {
    buttons: IBtn[][] = [
        [{ label: 'AC', type: 'function', value: 'AC' }, { label: '+/−', type: 'function', value: 'negate' }, { label: '%', type: 'function', value: 'percent' }, { label: '÷', type: 'operator', value: '/' }],
        [{ label: '7', type: 'number', value: '7' }, { label: '8', type: 'number', value: '8' }, { label: '9', type: 'number', value: '9' }, { label: '×', type: 'operator', value: '*' }],
        [{ label: '4', type: 'number', value: '4' }, { label: '5', type: 'number', value: '5' }, { label: '6', type: 'number', value: '6' }, { label: '−', type: 'operator', value: '-' }],
        [{ label: '1', type: 'number', value: '1' }, { label: '2', type: 'number', value: '2' }, { label: '3', type: 'number', value: '3' }, { label: '+', type: 'operator', value: '+' }],
        [{ label: '0', type: 'zero', value: '0', span: 2 }, { label: '.', type: 'number', value: '.' }, { label: '=', type: 'operator', value: '=' }],
    ];

    display = $state('0');
    prevVal: number | null = $state(null);
    op: string | null = $state(null);
    waiting = $state(false);
    activeOp: string | null = $state(null);

    constructor() {}

    calc(a: number, b: number, o: string): number {
        if (o === '+') return a + b;
        if (o === '-') return a - b;
        if (o === '*') return a * b;
        if (o === '/') return b !== 0 ? a / b : 0;
        return b;
    }

    press(btn: IBtn) {
        if (btn.type === 'number' || btn.type === 'zero') {
            if (btn.value === '.' && this.display.includes('.')) return;
            if (this.waiting) { this.display = btn.value === '.' ? '0.' : btn.value; this.waiting = false; }
            else { this.display = this.display === '0' && btn.value !== '.' ? btn.value : this.display + btn.value; }
            this.activeOp = null;
        } else if (btn.type === 'operator') {
            const cur = parseFloat(this.display);
            if (btn.value === '=') {
                if (this.op && this.prevVal !== null) { this.display = String(this.calc(this.prevVal, cur, this.op)); this.prevVal = null; this.op = null; }
                this.activeOp = null;
            } else {
                if (this.op && this.prevVal !== null && !this.waiting) { const r = this.calc(this.prevVal, cur, this.op); this.display = String(r); this.prevVal = r; }
                else { this.prevVal = cur; }
                this.op = btn.value; this.waiting = true; this.activeOp = btn.value;
            }
        } else if (btn.type === 'function') {
            if (btn.value === 'AC') { this.display = '0'; this.prevVal = null; this.op = null; this.waiting = false; this.activeOp = null; }
            else if (btn.value === 'negate') { this.display = String(-parseFloat(this.display)); }
            else if (btn.value === 'percent') { this.display = String(parseFloat(this.display) / 100); }
        }
    }

    getDisplayText(): string {
        const n = parseFloat(this.display);
        if (isNaN(n)) return '0';
        if (this.display.includes('.')) return this.display;
        if (Math.abs(n) >= 1e9) return n.toExponential(4);
        return n.toLocaleString('en-US', { maximumFractionDigits: 8 });
    }

    getFontSize(displayText: string): string {
        return displayText.length > 8 ? (displayText.length > 12 ? '38px' : '52px') : '72px';
    }
}
