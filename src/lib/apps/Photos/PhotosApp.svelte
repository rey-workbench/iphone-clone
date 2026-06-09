<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, Image, Heart, Folder, Search } from '@lucide/svelte';
  import { AppPhotosState } from './PhotosState.svelte';
  import Skeleton from '$lib/components/ui/Skeleton.svelte';

  const state = new AppPhotosState();

  onMount(() => {
    state.fetchPhotos();
  });
</script>

<div class="h-full pt-[54px] pb-0 bg-black flex flex-col ">
  {#if state.selectedPhoto}
    <div class="flex-1 flex flex-col">
      <div class="flex items-center px-4 py-2 border-b border-ios-sep">
        <button class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer flex items-center" onclick={() => state.closePhoto()}>
          <ChevronLeft size={20} class="mr-1" /> Photos
        </button>
      </div>
      <div class="flex-1 flex flex-col items-center justify-center bg-black p-4 gap-2">
        <img src={state.selectedPhoto.download_url} alt="Full view" class="max-w-full max-h-full rounded-xl object-contain" />
        <div class="text-white text-sm opacity-50">Photo by {state.selectedPhoto.author}</div>
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto">
      <div class="px-4 pt-2 pb-3">
        <h1 class="text-[34px] font-bold text-white">Library</h1>
      </div>
      {#if state.loading}
        <div class="grid grid-cols-3 gap-0.5 px-0.5">
          {#each Array(21) as _}
            <div class="aspect-square bg-ios-bg3">
              <Skeleton width="100%" height="100%" borderRadius="0" />
            </div>
          {/each}
        </div>
      {:else}
        <div class="grid grid-cols-3 gap-0.5 px-0.5">
          {#each state.photos as photo}
            <button class="aspect-square overflow-hidden border-none p-0 cursor-pointer bg-ios-bg3" onclick={() => state.selectPhoto(photo)}>
              <img src={photo.download_url} alt="" class="w-full h-full object-cover" loading="lazy" />
            </button>
          {/each}
        </div>
      {/if}
    </div>
    <div class="flex bg-[rgba(30,30,30,0.95)] backdrop-blur-[20px] border-t border-ios-sep pt-1.5 pb-8 shrink-0">
      {#each [
        { id: 'library', icon: Image, label: 'Library' },
        { id: 'foryou', icon: Heart, label: 'For You' },
        { id: 'albums', icon: Folder, label: 'Albums' },
        { id: 'search', icon: Search, label: 'Search' }
      ] as { id, icon: IconComponent, label }}
        <button class="flex-1 flex flex-col items-center gap-0.5 border-none bg-transparent cursor-pointer py-1 {state.tab === id ? 'text-ios-blue' : 'text-ios-label2'}" onclick={() => state.setTab(id as any)}>
          <IconComponent size={22} color={state.tab === id ? '#007AFF' : '#8E8E93'} />
          <span class="text-[10px] font-medium">{label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>
