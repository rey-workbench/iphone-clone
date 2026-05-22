<script lang="ts">
  import { ChevronLeft, Image, Heart, Folder, Search } from 'lucide-svelte';
  let selectedPhoto: string | null = $state(null);
  let tab: 'library' | 'foryou' | 'albums' | 'search' = $state('library');

  const photos = Array.from({ length: 24 }, (_, i) => `https://picsum.photos/400/400?random=${i + 1}`);
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col ">
  {#if selectedPhoto}
    <div class="flex-1 flex flex-col">
      <div class="flex items-center px-4 py-2 border-b border-ios-sep">
        <button class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer flex items-center" onclick={() => selectedPhoto = null}>
          <ChevronLeft size={20} class="mr-1" /> Photos
        </button>
      </div>
      <div class="flex-1 flex items-center justify-center bg-black p-4">
        <img src={selectedPhoto} alt="Full view" class="max-w-full max-h-full rounded-xl object-contain" />
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto">
      <div class="px-4 pt-2 pb-3">
        <h1 class="text-[34px] font-bold text-white">Library</h1>
      </div>
      <div class="grid grid-cols-3 gap-0.5 px-0.5">
        {#each photos as src}
          <button class="aspect-square overflow-hidden border-none p-0 cursor-pointer bg-ios-bg3" onclick={() => selectedPhoto = src}>
            <img {src} alt="" class="w-full h-full object-cover" loading="lazy" />
          </button>
        {/each}
      </div>
    </div>
    <div class="flex bg-[rgba(30,30,30,0.95)] backdrop-blur-[20px] border-t border-ios-sep py-1.5 shrink-0">
      {#each [
        { id: 'library', icon: Image, label: 'Library' },
        { id: 'foryou', icon: Heart, label: 'For You' },
        { id: 'albums', icon: Folder, label: 'Albums' },
        { id: 'search', icon: Search, label: 'Search' }
      ] as { id, icon: IconComponent, label }}
        <button class="flex-1 flex flex-col items-center gap-0.5 border-none bg-transparent cursor-pointer py-1 {tab === id ? 'text-ios-blue' : 'text-ios-label2'}" onclick={() => tab = id as typeof tab}>
          <IconComponent size={22} color={tab === id ? '#007AFF' : '#8E8E93'} />
          <span class="text-[10px] font-medium">{label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
