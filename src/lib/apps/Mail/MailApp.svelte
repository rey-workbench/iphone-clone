<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, Loader2 } from '@lucide/svelte';
  interface Email { id: string; from: string; subject: string; preview: string; date: string; read: boolean; body: string }

  let emails: Email[] = $state([]);
  let loading = $state(true);
  let selected: Email | null = $state(null);

  onMount(async () => {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/comments?_limit=15');
      if (res.ok) {
        const data = await res.json();
        emails = data.map((item: any, i: number) => ({
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
      loading = false;
    }
  });

  function openEmail(email: Email) {
    selected = email;
    emails = emails.map(e => e.id === email.id ? { ...e, read: true } : e);
  }
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col ">
  {#if selected}
    <div class="flex-1 flex flex-col">
      <div class="flex items-center px-4 py-2 border-b border-ios-sep">
        <button class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer flex items-center" onclick={() => selected = null}>
          <ChevronLeft size={20} class="mr-1" /> Inbox
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <h2 class="text-[22px] font-bold text-white mb-1">{selected.subject}</h2>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-9 h-9 rounded-full bg-ios-blue flex items-center justify-center text-[14px] font-semibold text-white shrink-0">{selected.from[0]}</div>
          <div class="flex flex-col"><span class="text-[15px] font-medium text-white">{selected.from}</span><span class="text-[13px] text-ios-label2">{selected.date}</span></div>
        </div>
        <p class="text-[17px] text-white leading-relaxed whitespace-pre-line">{selected.body}</p>
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto px-4">
      <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4">Inbox</h1>
      <div class="bg-ios-bg2 rounded-xl overflow-hidden">
        {#each emails as email, i}
          <button class="flex gap-3 p-3 px-4 w-full border-none bg-transparent cursor-pointer text-left text-white items-start" onclick={() => openEmail(email)}>
            {#if !email.read}<div class="w-2.5 h-2.5 rounded-full bg-ios-blue shrink-0 mt-1.5"></div>{:else}<div class="w-2.5 shrink-0"></div>{/if}
            <div class="flex-1 min-w-0">
              <div class="flex justify-between mb-0.5"><span class="text-[17px] {!email.read ? 'font-semibold' : 'font-normal'}">{email.from}</span><span class="text-[13px] text-ios-label2">{email.date}</span></div>
              <div class="text-[15px] {!email.read ? 'font-semibold' : 'font-normal'} truncate">{email.subject}</div>
              <div class="text-[14px] text-ios-label2 truncate mt-0.5">{email.preview}</div>
            </div>
          </button>
          {#if i < emails.length - 1}<div class="h-px bg-ios-sep ml-[40px]"></div>{/if}
        {/each}
      </div>
    </div>
  {/if}
</div>
