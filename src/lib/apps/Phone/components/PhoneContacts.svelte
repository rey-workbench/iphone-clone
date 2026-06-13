<script lang="ts">
  import { Phone } from '@lucide/svelte';
  import Skeleton from '$lib/os/components/ui/Skeleton.svelte';
  import type { PhoneAppState } from '../PhoneAppState.svelte';
  import { callState } from '../CallAppState.svelte';

  let { state } = $props<{ state: PhoneAppState }>();

  const handleContactCall = (e: MouseEvent) => {
    const id = (e.currentTarget as HTMLElement).dataset.id;
    if (id) {
      const c = state.contacts.find((contact: any) => String(contact.id) === id);
      if (c) callState.initiateCall(c);
    }
  };

</script>

<div class="px-4">
  <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4">Contacts</h1>
  <div class="bg-ios-bg2 rounded-xl overflow-hidden">
    {#if state.loadingContacts}
      {#each Array(5) as _, i (i)}
        <div class="flex items-center gap-3 p-2.5 px-4">
          <Skeleton width="36px" height="36px" borderRadius="50%" />
          <div class="flex-1 flex flex-col gap-1">
            <Skeleton width="120px" height="18px" />
            <Skeleton width="80px" height="14px" />
          </div>
          <Skeleton width="32px" height="32px" borderRadius="50%" />
        </div>
        {#if i < 4}<div class="h-px bg-ios-sep ml-4"></div>{/if}
      {/each}
    {:else if state.contacts.length === 0}
      <div class="p-4 text-center text-ios-label2">No contacts found</div>
    {:else}
      {#each state.contacts as c, i (i)}
        <div class="flex items-center gap-3 p-2.5 px-4">
          <div class="w-9 h-9 rounded-full bg-ios-fill flex items-center justify-center text-[16px] font-semibold text-white">{c.name[0]}</div>
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-[17px] text-white">{c.name}</span>
            <span class="text-[13px] text-ios-label2">{c.username}</span>
          </div>
          <button
            data-id={c.id}
            onclick={handleContactCall}
            class="w-8 h-8 rounded-full bg-ios-green/20 flex items-center justify-center border-none cursor-pointer"
            aria-label="Call {c.name}">
            <Phone size={16} class="text-ios-green" />
          </button>
        </div>
        {#if i < state.contacts.length - 1}<div class="h-px bg-ios-sep ml-4"></div>{/if}
      {/each}
    {/if}
  </div>
</div>
