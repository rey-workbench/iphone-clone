<script lang="ts">
  import { Settings, Download, Smartphone, ChevronRight } from "@lucide/svelte";
  import { netflixState } from "../NetflixState.svelte";
  import { systemState } from "$lib/states";

  // Generate mock downloads dynamically based on API data so it's not broken
  let downloads = $derived.by(() => {
    const apiData = [...netflixState.tvShows, ...netflixState.movies];
    if (apiData.length === 0) return [];
    
    return [
      {
        profile: systemState.currentUser?.name || systemState.currentUser?.username || "My Profile",
        avatar: "https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-88wkdmjrorckekha.jpg",
        items: [
          {
            title: apiData[0]?.title || apiData[0]?.name || "Stranger Things",
            episodes: 2,
            size: "1.2 GB",
            image: apiData[0]?.backdrop_path || apiData[0]?.poster_path,
          },
        ],
      },
      {
        profile: "Kids",
        avatar: "https://mir-s3-cdn-cf.behance.net/project_modules/disp/84c20033850498.56ba69ac290ea.png",
        items: [
          {
            title: apiData[1]?.title || apiData[1]?.name || "Peppa Pig",
            episodes: 10,
            size: "850 MB",
            image: apiData[1]?.backdrop_path || apiData[1]?.poster_path,
          },
        ],
      },
    ];
  });
</script>

<div class="w-full h-full pt-12 px-4 pb-24 overflow-y-auto overflow-x-hidden">
  <div class="flex items-center gap-2 mb-6 text-[#B3B3B3]">
    <Settings size={18} />
    <span class="text-[13px] font-medium tracking-wide">Smart Downloads</span>
    <span class="text-blue-500 text-[13px] font-medium ml-auto">ON</span>
  </div>

  <div class="flex flex-col gap-6">
    {#each downloads as profileData (profileData.profile)}
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded overflow-hidden">
            <img
              src={profileData.avatar}
              alt={profileData.profile}
              class="w-full h-full object-cover"
            />
          </div>
          <span class="text-lg font-bold text-white">{profileData.profile}</span
          >
        </div>

        <div class="flex flex-col gap-3">
          {#each profileData.items as item (item.title)}
            <div
              class="flex items-center gap-4 bg-[#1A1A1A] rounded p-2 relative"
            >
              <!-- Poster -->
              <div
                class="w-[120px] h-[68px] rounded overflow-hidden flex-shrink-0 relative bg-black"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  class="w-full h-full object-cover opacity-80"
                />
                <div class="absolute inset-0 flex items-center justify-center">
                  <div
                    class="w-8 h-8 rounded-full bg-black/50 border border-white flex items-center justify-center backdrop-blur-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="white"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      ><polygon points="5 3 19 12 5 21 5 3" /></svg
                    >
                  </div>
                </div>
              </div>

              <!-- Info -->
              <div class="flex flex-col flex-1 pl-2">
                <span class="text-[15px] font-semibold text-white"
                  >{item.title}</span
                >
                <span class="text-xs text-[#8C8C8C] mt-1"
                  >{item.episodes} Episodes | {item.size}</span
                >
              </div>

              <div class="pr-2 text-[#8C8C8C]">
                <ChevronRight size={20} />
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="mt-8 flex flex-col items-center gap-4 px-2">
    <button
      class="bg-white text-black text-[15px] font-bold px-8 py-3 rounded flex items-center justify-center w-full transition-colors hover:bg-white/80 border-none cursor-pointer"
    >
      Find Something to Download
    </button>
  </div>
</div>
