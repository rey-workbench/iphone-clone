<script lang="ts">
  import { notesState } from '$lib/stores';
  import type { Note } from '$lib/stores';

  let selectedNote: Note | null = $state(null);
  let editContent = $state('');
  let editTitle = $state('');

  function selectNote(note: Note) { selectedNote = note; editTitle = note.title; editContent = note.content; }

  function goBack() {
    if (selectedNote) {
      const id = selectedNote.id;
      notesState.update(notes => notes.map(n => n.id === id ? { ...n, title: editTitle, content: editContent, date: new Date() } : n));
    }
    selectedNote = null;
  }

  function addNote() {
    const n: Note = { id: String(Date.now()), title: 'New Note', content: '', date: new Date() };
    notesState.update(ns => [n, ...ns]);
    selectNote(n);
  }

  function deleteNote(id: string) { notesState.update(n => n.filter(note => note.id !== id)); selectedNote = null; }

  function fmtDate(d: Date) {
    const now = new Date();
    return d.toDateString() === now.toDateString()
      ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col ">
  {#if selectedNote}
    <div class="flex-1 flex flex-col">
      <div class="flex justify-between items-center px-4 py-2 border-b border-ios-sep">
        <button class="bg-transparent border-none text-[#FF9F0A] text-[17px] cursor-pointer" onclick={goBack}>← Notes</button>
        <button class="bg-transparent border-none text-[20px] cursor-pointer" onclick={() => selectedNote && deleteNote(selectedNote.id)} aria-label="Delete note">🗑️</button>
      </div>
      <div class="flex-1 p-4 flex flex-col gap-2">
        <input class="bg-transparent border-none text-white text-2xl font-bold outline-none w-full" bind:value={editTitle} placeholder="Title" />
        <textarea class="flex-1 bg-transparent border-none text-white text-[17px] outline-none resize-none leading-relaxed w-full" bind:value={editContent} placeholder="Start typing..."></textarea>
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
          <button class="w-full text-left p-3 px-4 bg-ios-bg2 border-none text-white cursor-pointer border-b border-ios-sep first:rounded-t-xl last:rounded-b-xl last:border-b-0" onclick={() => selectNote(note)}>
            <div class="text-[17px] font-semibold mb-1">{note.title}</div>
            <div class="flex gap-2 text-[13px] text-ios-label2">
              <span>{fmtDate(note.date)}</span>
              <span class="truncate flex-1">{note.content.substring(0, 50)}</span>
            </div>
          </button>
        {/each}
      </div>
      <div class="flex justify-between items-center px-4 py-2  bg-[rgba(30,30,30,0.95)] border-t border-ios-sep">
        <span></span>
        <span class="text-[13px] text-ios-label2">{$notesState.length} Notes</span>
        <button class="w-11 h-11 bg-transparent border-none text-[22px] cursor-pointer" onclick={addNote} aria-label="New note">✏️</button>
      </div>
    </div>
  {/if}
</div>
