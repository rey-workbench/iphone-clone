<script lang="ts">
  import { Star, Clock, User, Grid3x3, Voicemail, Phone, Delete, Info } from '@lucide/svelte';

  type TabId = 'favorites' | 'recents' | 'contacts' | 'keypad' | 'voicemail';
  let tab: TabId = $state<TabId>('keypad');
  let dialNumber = $state('');

  const recents = [
    { name: 'Tim Cook', time: 'Today, 2:34 PM', missed: false },
    { name: 'Craig Federighi', time: 'Today, 11:20 AM', missed: true },
    { name: 'Jony Ive', time: 'Yesterday, 5:15 PM', missed: false },
    { name: 'Phil Schiller', time: 'Yesterday, 3:00 PM', missed: false },
    { name: 'Steve Jobs', time: '2 days ago', missed: true },
  ];
  const contacts = [
    { name: 'Craig Federighi', phone: '+1 (555) 234-5678' },
    { name: 'Jony Ive', phone: '+1 (555) 345-6789' },
    { name: 'Phil Schiller', phone: '+1 (555) 456-7890' },
    { name: 'Tim Cook', phone: '+1 (555) 567-8901' },
  ];
  const keys = [
    [{ n: '1', s: '' }, { n: '2', s: 'ABC' }, { n: '3', s: 'DEF' }],
    [{ n: '4', s: 'GHI' }, { n: '5', s: 'JKL' }, { n: '6', s: 'MNO' }],
    [{ n: '7', s: 'PQRS' }, { n: '8', s: 'TUV' }, { n: '9', s: 'WXYZ' }],
    [{ n: '*', s: '' }, { n: '0', s: '+' }, { n: '#', s: '' }],
  ];
  const tabItems: { id: TabId; label: string; icon: any }[] = [
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recents', label: 'Recents', icon: Clock },
    { id: 'contacts', label: 'Contacts', icon: User },
    { id: 'keypad', label: 'Keypad', icon: Grid3x3 },
    { id: 'voicemail', label: 'Voicemail', icon: Voicemail },
  ];
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col ">
  <div class="flex-1 overflow-y-auto">
    {#if tab === 'keypad'}
      <div class="flex flex-col items-center py-5">
        <div class="text-4xl font-light text-white h-[50px] text-center tracking-wider tabular-nums">{dialNumber}</div>
        <div class="flex flex-col gap-3.5 py-5">
          {#each keys as row}
            <div class="flex gap-[22px]">
              {#each row as k}
                <button class="w-[78px] h-[78px] rounded-full bg-ios-fill border-none cursor-pointer flex flex-col items-center justify-center text-white active:bg-ios-fill/60 transition-colors" onclick={() => dialNumber += k.n}>
                  <span class="text-[32px] font-light leading-none">{k.n}</span>
                  <span class="text-[10px] font-medium tracking-widest text-ios-label2 h-3.5">{k.s}</span>
                </button>
              {/each}
            </div>
          {/each}
        </div>
        <div class="flex items-center justify-center gap-15 py-5">
          <span class="w-6"></span>
          <button class="w-16 h-16 rounded-full bg-ios-green border-none text-[28px] cursor-pointer flex items-center justify-center text-white" aria-label="Call">
            <Phone size={28} fill="currentColor" />
          </button>
          {#if dialNumber}
            <button class="bg-transparent border-none text-2xl cursor-pointer text-ios-label2" onclick={() => dialNumber = dialNumber.slice(0, -1)} aria-label="Backspace">
              <Delete size={28} />
            </button>
          {:else}
            <span class="w-6"></span>
          {/if}
        </div>
      </div>
    {:else if tab === 'recents'}
      <div class="px-4">
        <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4">Recents</h1>
        <div class="bg-ios-bg2 rounded-xl overflow-hidden">
          {#each recents as call, i}
            <div class="flex items-center p-3 px-4">
              <div class="flex-1 flex flex-col gap-0.5">
                <span class="text-[17px] font-medium {call.missed ? 'text-ios-red' : 'text-white'}">{call.name}</span>
                <span class="text-[13px] text-ios-label2">{call.time}</span>
              </div>
              <Info size={20} class="text-ios-blue" />
            </div>
            {#if i < recents.length - 1}<div class="h-px bg-ios-sep ml-4"></div>{/if}
          {/each}
        </div>
      </div>
    {:else if tab === 'contacts'}
      <div class="px-4">
        <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4">Contacts</h1>
        <div class="bg-ios-bg2 rounded-xl overflow-hidden">
          {#each contacts as c, i}
            <div class="flex items-center gap-3 p-2.5 px-4">
              <div class="w-9 h-9 rounded-full bg-ios-fill flex items-center justify-center text-[16px] font-semibold text-white">{c.name[0]}</div>
              <div class="flex flex-col gap-0.5"><span class="text-[17px] text-white">{c.name}</span><span class="text-[13px] text-ios-label2">{c.phone}</span></div>
            </div>
            {#if i < contacts.length - 1}<div class="h-px bg-ios-sep ml-4"></div>{/if}
          {/each}
        </div>
      </div>
    {:else}
      <div class="px-4">
        <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4">{tab === 'favorites' ? 'Favorites' : 'Voicemail'}</h1>
        <div class="flex flex-col items-center gap-2 py-20 text-ios-label2">
          {#if tab === 'favorites'}
            <Star size={48} />
          {:else}
            <Voicemail size={48} />
          {/if}
          <span class="text-[17px]">No {tab === 'favorites' ? 'Favorites' : 'Voicemail'}</span>
        </div>
      </div>
    {/if}
  </div>
  <div class="flex bg-[rgba(30,30,30,0.95)] backdrop-blur-[20px] border-t border-ios-sep py-1.5 shrink-0 justify-around">
    {#each tabItems as t}
      <button class="flex-1 flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer py-1 {tab === t.id ? 'text-ios-blue' : 'text-ios-label2'}" onclick={() => tab = t.id}>
        <t.icon size={24} />
        <span class="text-[10px] font-medium">{t.label}</span>
      </button>
    {/each}
  </div>
</div>
