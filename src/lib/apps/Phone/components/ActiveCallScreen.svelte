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

  function setSrcObject(node: HTMLVideoElement, stream: MediaStream | null) {
    node.srcObject = stream;
    return {
      update(newStream: MediaStream | null) {
        node.srcObject = newStream;
      }
    };
  }

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
      action: () => callState.toggleVideo(),
      active: () => callState.isVideo,
    },
    {
      id: "contacts",
      icon: User,
      label: "contacts",
      action: () => {},
      active: () => false,
    },
  ];

  let showControls = $state(true);

  // Auto-hide controls when video starts
  $effect(() => {
    if (callState.isVideo) {
      showControls = false;
    } else {
      showControls = true;
    }
  });
</script>

<!-- Hidden audio element -->


<!-- Full-screen overlay -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="absolute inset-0 z-[9999] bg-[#1a1a1a] flex flex-col items-center select-none rounded-[40px] overflow-hidden"
     style="background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);"
     onclick={() => { if (callState.isVideo) showControls = !showControls; }}
>
  {#if callState.isVideo}
    <!-- Remote Video Background -->
    <video
      use:setSrcObject={callState.remoteStream}
      autoplay
      playsinline
      class="absolute inset-0 w-full h-full object-cover bg-black"
    ></video>

    <!-- Local Video PiP -->
    <div class="absolute top-16 right-4 w-28 h-40 bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-50">
      <video
        use:setSrcObject={callState.localStream}
        autoplay
        playsinline
        muted
        class="w-full h-full object-cover scale-x-[-1]"
      ></video>
    </div>
  {/if}

  <!-- Top spacer -->
  <div class="h-16"></div>

  <!-- Avatar & Name (Hide when video is on) -->
  <div class="flex flex-col items-center z-10 transition-opacity duration-300 {callState.isVideo ? 'opacity-0 pointer-events-none' : 'opacity-100'}">
    <div
      class="w-24 h-24 rounded-full bg-[#3a3a3a] flex items-center justify-center text-white text-4xl font-semibold mb-4 shadow-2xl ring-4 ring-white/10"
    >
      {callState.remoteContact?.name?.substring(0, 1) ?? "?"}
    </div>

    <h1 class="text-[34px] font-semibold text-white tracking-tight mb-1" style="text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
      {callState.remoteContact?.name ?? "Unknown"}
    </h1>

    <p class="text-[17px] text-white/90 tabular-nums mb-8" style="text-shadow: 0 1px 5px rgba(0,0,0,0.5);">
      {callState.durationFormatted}
    </p>
  </div>

  <!-- Controls Grid -->
  <div class="grid grid-cols-3 gap-x-6 gap-y-5 px-8 mb-auto z-10 transition-opacity duration-300 {showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}">
    {#each controls as c}
      <button
        onclick={c.action}
        class="flex flex-col items-center gap-2 group"
        aria-label={c.label}
      >
        <div
          class="w-[70px] h-[70px] rounded-2xl flex items-center justify-center transition-all backdrop-blur-md border border-white/10
                    {c.active()
            ? 'bg-white text-black'
            : 'bg-black/40 text-white'}
                    active:scale-95"
        >
          <c.icon size={28} />
        </div>
        <span class="text-[13px] text-white/90 font-medium drop-shadow-md">{c.label}</span>
      </button>
    {/each}
  </div>

  <!-- Hang Up -->
  <div class="pb-16 z-10 transition-opacity duration-300 {showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}">
    <button
      onclick={() => callState.hangUp()}
      class="w-[72px] h-[72px] rounded-full bg-[#FF3B30] flex items-center justify-center shadow-lg shadow-red-900/50 active:opacity-80 transition-opacity text-white"
      aria-label="End call"
    >
      <PhoneOff size={32} />
    </button>
  </div>
</div>
