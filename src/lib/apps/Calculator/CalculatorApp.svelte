<script lang="ts">
  type BtnType = 'number' | 'operator' | 'function' | 'zero';
  interface Btn { label: string; type: BtnType; value: string; span?: number }

  const buttons: Btn[][] = [
    [{ label: 'AC', type: 'function', value: 'AC' }, { label: '+/−', type: 'function', value: 'negate' }, { label: '%', type: 'function', value: 'percent' }, { label: '÷', type: 'operator', value: '/' }],
    [{ label: '7', type: 'number', value: '7' }, { label: '8', type: 'number', value: '8' }, { label: '9', type: 'number', value: '9' }, { label: '×', type: 'operator', value: '*' }],
    [{ label: '4', type: 'number', value: '4' }, { label: '5', type: 'number', value: '5' }, { label: '6', type: 'number', value: '6' }, { label: '−', type: 'operator', value: '-' }],
    [{ label: '1', type: 'number', value: '1' }, { label: '2', type: 'number', value: '2' }, { label: '3', type: 'number', value: '3' }, { label: '+', type: 'operator', value: '+' }],
    [{ label: '0', type: 'zero', value: '0', span: 2 }, { label: '.', type: 'number', value: '.' }, { label: '=', type: 'operator', value: '=' }],
  ];

  let display = $state('0');
  let prevVal: number | null = $state(null);
  let op: string | null = $state(null);
  let waiting = $state(false);
  let activeOp: string | null = $state(null);

  function calc(a: number, b: number, o: string): number {
    if (o === '+') return a + b;
    if (o === '-') return a - b;
    if (o === '*') return a * b;
    if (o === '/') return b !== 0 ? a / b : 0;
    return b;
  }

  function press(btn: Btn) {
    if (btn.type === 'number' || btn.type === 'zero') {
      if (btn.value === '.' && display.includes('.')) return;
      if (waiting) { display = btn.value === '.' ? '0.' : btn.value; waiting = false; }
      else { display = display === '0' && btn.value !== '.' ? btn.value : display + btn.value; }
      activeOp = null;
    } else if (btn.type === 'operator') {
      const cur = parseFloat(display);
      if (btn.value === '=') {
        if (op && prevVal !== null) { display = String(calc(prevVal, cur, op)); prevVal = null; op = null; }
        activeOp = null;
      } else {
        if (op && prevVal !== null && !waiting) { const r = calc(prevVal, cur, op); display = String(r); prevVal = r; }
        else { prevVal = cur; }
        op = btn.value; waiting = true; activeOp = btn.value;
      }
    } else if (btn.type === 'function') {
      if (btn.value === 'AC') { display = '0'; prevVal = null; op = null; waiting = false; activeOp = null; }
      else if (btn.value === 'negate') { display = String(-parseFloat(display)); }
      else if (btn.value === 'percent') { display = String(parseFloat(display) / 100); }
    }
  }

  function fmt(v: string): string {
    const n = parseFloat(v);
    if (isNaN(n)) return '0';
    if (v.includes('.')) return v;
    if (Math.abs(n) >= 1e9) return n.toExponential(4);
    return n.toLocaleString('en-US', { maximumFractionDigits: 8 });
  }

  let displayText = $derived(fmt(display));
  let fontSize = $derived(displayText.length > 8 ? (displayText.length > 12 ? '38px' : '52px') : '72px');
</script>

<div class="h-full pt-[54px] pb-5 flex flex-col bg-black px-3 ">
  <div class="flex-1 flex items-end justify-end px-4 pb-3 min-h-[120px]">
    <div class="text-white font-light text-right leading-tight transition-all" style="font-size: {fontSize}">{displayText}</div>
  </div>
  <div class="flex flex-col gap-3">
    {#each buttons as row}
      <div class="flex gap-3 justify-center">
        {#each row as btn}
          <button
            class="w-[78px] h-[78px] rounded-full border-none text-[30px] cursor-pointer flex items-center justify-center transition-all duration-100 active:opacity-70
              {btn.type === 'function' ? 'bg-[#A5A5A5] text-black text-2xl' : ''}
              {btn.type === 'number' || btn.type === 'zero' ? 'bg-[#333] text-white' : ''}
              {btn.type === 'operator' ? (activeOp === btn.value ? 'bg-white text-[#FF9F0A]' : 'bg-[#FF9F0A] text-white') + ' text-[34px]' : ''}
              {btn.span === 2 ? 'w-[168px]! rounded-[40px]! pl-7! justify-start!' : ''}"
            onclick={() => press(btn)}
          >{btn.label}</button>
        {/each}
      </div>
    {/each}
  </div>
</div>
