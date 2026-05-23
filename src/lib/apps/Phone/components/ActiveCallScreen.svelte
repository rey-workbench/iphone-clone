<script lang="ts">
  import { callState } from "../CallState.svelte";
  import {
    MicOff,
    Grid3x3,
    Volume2,
    Plus,
    Video,
    User,
    PhoneOff,
  } from "@lucide/svelte";

  const controls = [
    {
      id: "mute",
      icon: MicOff,
      label: "mute",
      action: () => callState.toggleMute(),
      active: () => callState.isMuted,
    },
    {
      id: "keypad",
      icon: Grid3x3,
      label: "keypad",
      action: () => {},
      active: () => false,
    },
    {
      id: "speaker",
      icon: Volume2,
      label: "speaker",
      action: () => callState.toggleSpeaker(),
      active: () => callState.isSpeaker,
    },
    {
      id: "add",
      icon: Plus,
      label: "add call",
      action: () => {},
      active: () => false,
    },
    {
      id: "video",
      icon: Video,
      label: "FaceTime",
      action: () => {},
      active: () => false,
    },
    {
      id: "contacts",
      icon: User,
      label: "contacts",
      action: () => {},
      active: () => false,
    },
  ];
</script>

<!-- Hidden audio element -->
<audio id="remote-audio" autoplay playsinline style="display:none"></audio>

<!-- Full-screen overlay -->
<div
  class="fixed inset-0 z-[9999] bg-[#1a1a1a] flex flex-col items-center select-none"
  style="background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);"
>
  <!-- Top spacer -->
  <div class="h-16"></div>

  <!-- Avatar -->
  <div
    class="w-24 h-24 rounded-full bg-[#3a3a3a] flex items-center justify-center text-white text-4xl font-semibold mb-4 shadow-2xl ring-4 ring-white/10"
  >
    {callState.remoteContact?.name?.substring(0, 1) ?? "?"}
  </div>

  <!-- Contact Name -->
  <h1 class="text-[34px] font-semibold text-white tracking-tight mb-1">
    {callState.remoteContact?.name ?? "Unknown"}
  </h1>

  <!-- Duration Timer -->
  <p class="text-[17px] text-white/60 tabular-nums mb-8">
    {callState.durationFormatted}
  </p>

  <!-- Controls Grid -->
  <div class="grid grid-cols-3 gap-x-6 gap-y-5 px-8 mb-auto">
    {#each controls as c}
      <button
        onclick={c.action}
        class="flex flex-col items-center gap-2 group"
        aria-label={c.label}
      >
        <div
          class="w-[70px] h-[70px] rounded-2xl flex items-center justify-center transition-all
                    {c.active()
            ? 'bg-white text-black'
            : 'bg-[#3a3a3a] text-white'}
                    active:scale-95"
        >
          <c.icon size={28} />
        </div>
        <span class="text-[13px] text-white/60 font-medium">{c.label}</span>
      </button>
    {/each}
  </div>

  <!-- Hang Up -->
  <div class="pb-16">
    <button
      onclick={() => callState.hangUp()}
      class="w-[72px] h-[72px] rounded-full bg-[#FF3B30] flex items-center justify-center shadow-lg shadow-red-900/50 active:opacity-80 transition-opacity text-white"
      aria-label="End call"
    >
      <PhoneOff size={32} />
    </button>
  </div>
</div>
