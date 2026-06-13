<script lang="ts">
  import { Star, Clock, User, Grid3x3, Voicemail, Phone, Delete, Info, PhoneIncoming, PhoneOutgoing, PhoneMissed, Video } from '@lucide/svelte';
  import { PhoneAppState } from './PhoneAppState.svelte';
  import { callState } from './CallAppState.svelte';
  import IncomingCallScreen from './components/IncomingCallScreen.svelte';
  import ActiveCallScreen from './components/ActiveCallScreen.svelte';
  import PhoneRecents from './components/PhoneRecents.svelte';
  import PhoneContacts from './components/PhoneContacts.svelte';
  import Skeleton from '$lib/os/components/ui/Skeleton.svelte';

  const state = new PhoneAppState();

  const tabItems: { id: any; label: string; icon: any }[] = [
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recents', label: 'Recents', icon: Clock },
    { id: 'contacts', label: 'Contacts', icon: User },
    { id: 'keypad', label: 'Keypad', icon: Grid3x3 },
    { id: 'voicemail', label: 'Voicemail', icon: Voicemail },
  ];

  const handleKeyClick = (e: MouseEvent) => {
    const key = (e.currentTarget as HTMLElement).dataset.key;
    if (key) state.appendNumber(key);
  };

  const handleCall = () => {
    if (state.dialNumber) {
      callState.initiateCall({ id: state.dialNumber, name: state.dialNumber });
    }
  };

  const handleBackspace = () => state.backspace();

  const handleTabClick = (e: MouseEvent) => {
    const tabId = (e.currentTarget as HTMLElement).dataset.tab;
    if (tabId) state.tab = tabId as any;
  };
</script>

<div class="h-full pt-[54px] pb-0 bg-black flex flex-col ">
  <div class="flex-1 overflow-y-auto">
    {#if state.tab === 'keypad'}
      <div class="flex flex-col items-center py-5">
        <div class="text-4xl font-light text-white h-[50px] text-center tracking-wider tabular-nums">{state.dialNumber}</div>
        <div class="flex flex-col gap-3.5 py-5">
          {#each state.keys as row, i (i)}
            <div class="flex gap-[22px]">
              {#each row as k (k.n || k.s)}
                <button 
                  data-key={k.n}
                  class="w-[78px] h-[78px] rounded-full bg-ios-fill border-none cursor-pointer flex flex-col items-center justify-center text-white active:bg-ios-fill/60 transition-colors" 
                  onclick={handleKeyClick}
                >
                  <span class="text-[32px] font-light leading-none">{k.n}</span>
                  <span class="text-[10px] font-medium tracking-widest text-ios-label2 h-3.5">{k.s}</span>
                </button>
              {/each}
            </div>
          {/each}
        </div>
        <div class="flex items-center justify-center gap-15 py-5">
          <span class="w-6"></span>
          <button
            onclick={handleCall}
            class="w-16 h-16 rounded-full bg-ios-green border-none text-[28px] cursor-pointer flex items-center justify-center text-white"
            aria-label="Call">
            <Phone size={28} fill="currentColor" />
          </button>
          {#if state.dialNumber}
            <button class="bg-transparent border-none text-2xl cursor-pointer text-ios-label2" onclick={handleBackspace} aria-label="Backspace">
              <Delete size={28} />
            </button>
          {:else}
            <span class="w-6"></span>
          {/if}
        </div>
      </div>
    {:else if state.tab === 'recents'}
      <PhoneRecents {state} />
    {:else if state.tab === 'contacts'}
      <PhoneContacts {state} />
    {:else}
      <div class="px-4">
        <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4">{state.tab === 'favorites' ? 'Favorites' : 'Voicemail'}</h1>
        <div class="flex flex-col items-center gap-2 py-20 text-ios-label2">
          {#if state.tab === 'favorites'}
            <Star size={48} />
          {:else}
            <Voicemail size={48} />
          {/if}
          <span class="text-[17px]">No {state.tab === 'favorites' ? 'Favorites' : 'Voicemail'}</span>
        </div>
      </div>
    {/if}
  </div>
  <div class="flex bg-[rgba(30,30,30,0.95)] backdrop-blur-[20px] border-t border-ios-sep pt-1.5 pb-8 shrink-0 justify-around">
    {#each tabItems as t (t.id)}
      <button 
        data-tab={t.id}
        class="flex-1 flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer py-1 {state.tab === t.id ? 'text-ios-blue' : 'text-ios-label2'}" 
        onclick={handleTabClick}
      >
        <t.icon size={24} />
        <span class="text-[10px] font-medium">{t.label}</span>
      </button>
    {/each}
  </div>
</div>
