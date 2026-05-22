<script lang="ts">
  import { Trash2, SquarePen, ChevronLeft } from '@lucide/svelte';
  import { notesState } from '$lib/stores';
  import { AppNotesState } from './NotesState.svelte';

  const state = new AppNotesState();
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col ">
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
        <span class="text-[13px] text-ios-label2">{$notesState.length} Notes</span>
      </div>
      <div class="flex-1 overflow-y-auto px-4">
        {#each $notesState as note}
          <button class="w-full text-left p-3 px-4 bg-ios-bg2 border-none text-white cursor-pointer border-b border-ios-sep first:rounded-t-xl last:rounded-b-xl last:border-b-0" onclick={() => state.selectNote(note)}>
            <div class="text-[17px] font-semibold mb-1">{note.title}</div>
            <div class="flex gap-2 text-[13px] text-ios-label2">
              <span>{state.fmtDate(note.date)}</span>
              <span class="truncate flex-1">{note.content.substring(0, 50)}</span>
            </div>
          </button>
        {/each}
      </div>
      <div class="flex justify-between items-center px-4 py-2 bg-[rgba(30,30,30,0.95)] border-t border-ios-sep">
        <span></span>
        <span class="text-[13px] text-ios-label2">{$notesState.length} Notes</span>
        <button class="w-11 h-11 bg-transparent border-none text-[#FF9F0A] cursor-pointer flex justify-end items-center" onclick={() => state.addNote()} aria-label="New note">
          <SquarePen size={22} />
        </button>
      </div>
    </div>
  {/if}
</div>
