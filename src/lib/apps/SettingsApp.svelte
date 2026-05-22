<script lang="ts">
  import { settingsState } from '$lib/stores';
  import { 
    ChevronRight, Plane, Wifi, Bluetooth, Antenna, Link, 
    Bell, Volume2, Moon, Hourglass, Settings, Sun, 
    LayoutGrid, Accessibility, Image, Battery, Lock 
  } from '@lucide/svelte';

  let searchText = $state('');

  const profile = { name: 'John Appleseed', initials: 'JA' };

  let toggleItems = $derived([
    { id: 'airplane', icon: Plane, bg: '#FF9500', label: 'Airplane Mode', toggle: true, value: $settingsState.airplaneMode },
    { id: 'wifi', icon: Wifi, bg: '#007AFF', label: 'Wi-Fi', detail: $settingsState.wifiEnabled ? 'Home' : 'Off' },
    { id: 'bluetooth', icon: Bluetooth, bg: '#007AFF', label: 'Bluetooth', detail: $settingsState.bluetoothEnabled ? 'On' : 'Off' },
    { id: 'cellular', icon: Antenna, bg: '#34C759', label: 'Cellular', detail: '' },
    { id: 'hotspot', icon: Link, bg: '#34C759', label: 'Personal Hotspot', detail: 'Off' },
  ]);

  const general = [
    { icon: Bell, bg: '#FF3B30', label: 'Notifications' },
    { icon: Volume2, bg: '#FF2D55', label: 'Sounds & Haptics' },
    { icon: Moon, bg: '#5856D6', label: 'Focus' },
    { icon: Hourglass, bg: '#5856D6', label: 'Screen Time' },
  ];

  const settings = [
    { icon: Settings, bg: '#8E8E93', label: 'General' },
    { icon: Sun, bg: '#007AFF', label: 'Display & Brightness' },
    { icon: LayoutGrid, bg: '#007AFF', label: 'Home Screen & App Library' },
    { icon: Accessibility, bg: '#007AFF', label: 'Accessibility' },
    { icon: Image, bg: '#34C759', label: 'Wallpaper' },
    { icon: Battery, bg: '#34C759', label: 'Battery' },
    { icon: Lock, bg: '#007AFF', label: 'Privacy & Security' },
  ];

  function toggle(id: string) {
    settingsState.update(s => {
      if (id === 'airplane') s.airplaneMode = !s.airplaneMode;
      if (id === 'wifi') s.wifiEnabled = !s.wifiEnabled;
      if (id === 'bluetooth') s.bluetoothEnabled = !s.bluetoothEnabled;
      return s;
    });
  }
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col ">
  <div class="px-5 pt-2 pb-1"><h1 class="text-[34px] font-bold text-white">Settings</h1></div>
  <div class="px-4 py-1.5 pb-2.5">
    <input type="text" placeholder="Search" bind:value={searchText}
      class="w-full h-9 rounded-[10px] bg-ios-fill border-none text-white px-3 text-[17px] outline-none placeholder:text-ios-label2" />
  </div>
  <div class="flex-1 overflow-y-auto px-4 pb-10">
    <!-- Profile -->
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      <button class="flex items-center gap-3 p-3 px-4 w-full border-none bg-transparent cursor-pointer text-left text-white">
        <div class="w-14 h-14 rounded-full bg-linear-to-br from-ios-blue to-ios-indigo flex items-center justify-center text-xl font-semibold text-white shrink-0">{profile.initials}</div>
        <div class="flex-1 flex flex-col gap-0.5">
          <span class="text-lg font-medium">{profile.name}</span>
          <span class="text-[13px] text-ios-label2">Apple Account, iCloud & more</span>
        </div>
        <ChevronRight size={16} color="rgba(255,255,255,0.3)" />
      </button>
    </div>
    <!-- Connectivity -->
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      {#each toggleItems as item, i}
        <button class="flex items-center gap-3 py-[11px] px-4 w-full border-none bg-transparent cursor-pointer text-white text-left" onclick={() => item.toggle && toggle(item.id)}>
          <div class="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style="background:{item.bg}">
            <item.icon size={16} color="white" />
          </div>
          <div class="flex-1 text-[17px]">{item.label}</div>
          {#if item.toggle}
            <div class="w-[51px] h-[31px] rounded-2xl relative transition-colors duration-200 shrink-0 {item.value ? 'bg-ios-green' : 'bg-[#39393D]'}">
              <div class="w-[27px] h-[27px] rounded-full bg-white absolute top-[2px] left-[2px] transition-transform duration-200 shadow-md {item.value ? 'translate-x-5' : ''}"></div>
            </div>
          {:else}
            <span class="text-[15px] text-ios-label2 mr-1">{item.detail}</span>
            <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
          {/if}
        </button>
        {#if i < toggleItems.length - 1}<div class="h-px bg-ios-sep ml-[52px]"></div>{/if}
      {/each}
    </div>
    <!-- General -->
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      {#each general as item, i}
        <button class="flex items-center gap-3 py-[11px] px-4 w-full border-none bg-transparent cursor-pointer text-white text-left">
          <div class="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style="background:{item.bg}">
            <item.icon size={16} color="white" />
          </div>
          <div class="flex-1 text-[17px]">{item.label}</div>
          <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
        </button>
        {#if i < general.length - 1}<div class="h-px bg-ios-sep ml-[52px]"></div>{/if}
      {/each}
    </div>
    <!-- Settings -->
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      {#each settings as item, i}
        <button class="flex items-center gap-3 py-[11px] px-4 w-full border-none bg-transparent cursor-pointer text-white text-left">
          <div class="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style="background:{item.bg}">
            <item.icon size={16} color="white" />
          </div>
          <div class="flex-1 text-[17px]">{item.label}</div>
          <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
        </button>
        {#if i < settings.length - 1}<div class="h-px bg-ios-sep ml-[52px]"></div>{/if}
      {/each}
    </div>
  </div>
</div>
