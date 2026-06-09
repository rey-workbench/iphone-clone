<script lang="ts">
  import { Trash2, SquarePen, ChevronLeft } from '@lucide/svelte';
  import { AppNotesState } from './NotesState.svelte';
  import Skeleton from '$lib/components/ui/Skeleton.svelte';
  const state = new AppNotesState();

  $effect(() => {
    state.load();
  });
</script>

<div class="h-full pt-13.5 pb-0 bg-black flex flex-col ">
  {#if state.selectedNote}
    <div class="flex-1 flex flex-col">
      <div class="flex justify-between items-center px-4 py-2 border-b border-ios-sep">
        <button class="bg-transparent border-none text-[#FF9F0A] text-[17px] cursor-pointer flex items-center" onclick={() => state.goBack()}>
          <ChevronLeft size={20} class="mr-1" /> Notes
        </button>
        <button class="bg-transparent border-none text-[#FF9F0A] cursor-pointer" onclick={() => state.selectedNote && state.deleteNote(state.selectedNote.id)} aria-label="Delete note">
          <Trash2 size={20} />
        </button>
      </div>
      <div class="flex-1 p-4 flex flex-col gap-2">
        <input class="bg-transparent border-none text-white text-2xl font-bold outline-none w-full" bind:value={state.editTitle} placeholder="Title" />
        <textarea class="flex-1 bg-transparent border-none text-white text-[17px] outline-none resize-none leading-relaxed w-full" bind:value={state.editContent} placeholder="Start typing..."></textarea>
      </div>
    </div>
  {:else}
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="px-5 pt-2 pb-3">
        <h1 class="text-[34px] font-bold text-white">Notes</h1>
        {#if !state.loading}
          <span class="text-[13px] text-ios-label2">{state.notes.length} Notes</span>
        {/if}
      </div>
      <div class="flex-1 overflow-y-auto px-4">
        {#if state.loading}
          <div class="bg-ios-bg2 rounded-xl overflow-hidden">
            {#each Array(4) as _, i}
              <div class="w-full text-left p-3 px-4 flex flex-col gap-1.5 {i < 3 ? 'border-b border-ios-sep' : ''}">
                <Skeleton width="120px" height="20px" />
                <div class="flex gap-2">
                  <Skeleton width="60px" height="16px" />
                  <Skeleton width="140px" height="16px" />
                </div>
              </div>
            {/each}
          </div>
        {:else}
          {#each state.notes as note}
            <button class="w-full text-left p-3 px-4 bg-ios-bg2 border-none text-white cursor-pointer border-b border-ios-sep first:rounded-t-xl last:rounded-b-xl last:border-b-0" onclick={() => state.selectNote(note)}>
              <div class="text-[17px] font-semibold mb-1">{note.title}</div>
              <div class="flex gap-2 text-[13px] text-ios-label2">
                <span>{state.fmtDate(note.date)}</span>
                <span class="truncate flex-1">{note.content.substring(0, 50)}</span>
              </div>
            </button>
          {/each}
        {/if}
      </div>
      <div class="flex justify-between items-center px-4 pt-2 pb-8 bg-[rgba(30,30,30,0.95)] border-t border-ios-sep">
        <span></span>
        <span class="text-[13px] text-ios-label2">{state.notes.length} Notes</span>
        <button class="w-11 h-11 bg-transparent border-none text-[#FF9F0A] cursor-pointer flex justify-end items-center" onclick={() => state.addNote()} aria-label="New note">
          <SquarePen size={22} />
        </button>
      </div>
    </div>
  {/if}
</div>
