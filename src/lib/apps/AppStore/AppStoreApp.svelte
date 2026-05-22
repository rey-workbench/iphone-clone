<script lang="ts">
  import { 
    Camera, Music, MessageCircle, Headphones, MonitorPlay, 
    Gamepad2, FileText, Cpu, CalendarDays, Smartphone, Search 
  } from '@lucide/svelte';

  type TabId = 'today' | 'games' | 'apps' | 'search';
  let tab: TabId = $state<TabId>('today');

  const featured = [
    { name: 'Minecraft', dev: 'Mojang', img: 'https://picsum.photos/400/200?random=100', cat: 'Adventure' },
    { name: 'GarageBand', dev: 'Apple', img: 'https://picsum.photos/400/200?random=101', cat: 'Music' },
    { name: 'Procreate', dev: 'Savage', img: 'https://picsum.photos/400/200?random=102', cat: 'Graphics' },
  ];
  const topApps = [
    { name: 'Instagram', dev: 'Meta', icon: Camera, cat: 'Social', rank: 1 },
    { name: 'TikTok', dev: 'ByteDance', icon: Music, cat: 'Entertainment', rank: 2 },
    { name: 'WhatsApp', dev: 'Meta', icon: MessageCircle, cat: 'Social', rank: 3 },
    { name: 'Spotify', dev: 'Spotify AB', icon: Headphones, cat: 'Music', rank: 4 },
    { name: 'YouTube', dev: 'Google', icon: MonitorPlay, cat: 'Entertainment', rank: 5 },
    { name: 'Discord', dev: 'Discord Inc.', icon: Gamepad2, cat: 'Social', rank: 6 },
    { name: 'Notion', dev: 'Notion Labs', icon: FileText, cat: 'Productivity', rank: 7 },
    { name: 'ChatGPT', dev: 'OpenAI', icon: Cpu, cat: 'Productivity', rank: 8 },
  ];

  const tabItems: { id: TabId; label: string; icon: any }[] = [
    { id: 'today', label: 'Today', icon: CalendarDays },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'apps', label: 'Apps', icon: Smartphone },
    { id: 'search', label: 'Search', icon: Search },
  ];
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col ">
  <div class="flex-1 overflow-y-auto px-4 ">
    <div class="px-1 py-2 pb-4">
      <span class="text-[13px] text-ios-label2 uppercase tracking-wider font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      <h1 class="text-[34px] font-bold text-white mt-0.5">Today</h1>
    </div>
    <div class="flex flex-col gap-4 mb-6">
      {#each featured as app}
        <div class="rounded-2xl overflow-hidden bg-ios-bg2">
          <img src={app.img} alt={app.name} class="w-full h-[180px] object-cover" />
          <div class="p-3"><div class="text-[11px] text-ios-label2 uppercase tracking-wider font-semibold">{app.cat}</div><div class="text-[20px] font-bold text-white">{app.name}</div><div class="text-[13px] text-ios-label2">{app.dev}</div></div>
        </div>
      {/each}
    </div>
    <h2 class="text-[22px] font-bold text-white mb-3 px-1">Top Free Apps</h2>
    <div class="bg-ios-bg2 rounded-xl overflow-hidden">
      {#each topApps as app, i}
        <div class="flex items-center gap-3 p-2.5 px-4">
          <span class="text-[17px] text-ios-label2 w-4 text-right font-medium">{app.rank}</span>
          <div class="w-12 h-12 rounded-xl bg-ios-fill flex items-center justify-center shrink-0">
            <app.icon size={24} color="white" />
          </div>
          <div class="flex-1 min-w-0"><div class="text-[17px] text-white truncate">{app.name}</div><div class="text-[13px] text-ios-label2">{app.cat}</div></div>
          <button class="px-4 py-1.5 rounded-full bg-ios-fill border-none text-ios-blue text-[15px] font-semibold cursor-pointer">GET</button>
        </div>
        {#if i < topApps.length - 1}<div class="h-px bg-ios-sep ml-[76px]"></div>{/if}
      {/each}
    </div>
  </div>
  <div class="flex bg-[rgba(30,30,30,0.95)] backdrop-blur-[20px] border-t border-ios-sep py-1.5 shrink-0 justify-around">
    {#each tabItems as t}
      <button class="flex-1 flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer py-1 {tab === t.id ? 'text-ios-blue' : 'text-ios-label2'}" onclick={() => tab = t.id}>
        <t.icon size={24} />
        <span class="text-[10px] font-medium">{t.label}</span>
      </button>
    {/each}
  </div>
</div>
