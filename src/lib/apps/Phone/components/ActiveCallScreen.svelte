<script lang="ts">
  import { callState } from "../CallAppState.svelte";
  import {
    MicOff,
    Grid3x3,
    Volume2,
    Plus,
    Video,
    User,
    PhoneOff,
    Star,
    RefreshCcw,
    VideoOff,
    Mic,
  } from "@lucide/svelte";

  function setSrcObject(node: HTMLVideoElement, stream: MediaStream | null) {
    node.srcObject = stream;
    return {
      update(newStream: MediaStream | null) {
        node.srcObject = newStream;
      },
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
      active: () => callState.isLocalVideo,
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

  const handleContainerClick = () => {
    if (callState.isVideo) showControls = !showControls;
  };
  const handleStopPropagation = (e: MouseEvent) => e.stopPropagation();
  const handleToggleMute = () => callState.toggleMute();
  const handleToggleVideo = () => callState.toggleVideo();
  const handleToggleSpeaker = () => callState.toggleSpeaker();
  const handleHangUp = () => callState.hangUp();
  const handleContainerKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") handleContainerClick();
  };
  const handleStopPropagationKeydown = (e: KeyboardEvent) => e.stopPropagation();
</script>

<div
  class="absolute inset-0 z-9999 bg-[#1a1a1a] flex flex-col items-center select-none rounded-[40px] overflow-hidden"
  style:background="linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)"
  role="button"
  tabindex="0"
  onclick={handleContainerClick}
  onkeydown={handleContainerKeydown}
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
    <div
      class="absolute top-16 right-4 w-28 h-40 bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-50"
    >
      <video
        use:setSrcObject={callState.localStream}
        autoplay
        playsinline
        muted
        class="w-full h-full object-cover scale-x-[-1]"
      ></video>
    </div>
  {/if}

  <!-- Top Avatar & Name -->
  {#if callState.isVideo}
    <!-- Video Mode: Top Left Avatar & Name -->
    <div
      class="absolute top-12 left-6 z-50 flex items-center gap-3 transition-opacity duration-300 {showControls
        ? 'opacity-100'
        : 'opacity-0 pointer-events-none'}"
    >
      <div
        class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white text-xl overflow-hidden backdrop-blur-md ring-2 ring-white/10"
      >
        {callState.remoteContact?.name?.substring(0, 1) ?? "?"}
      </div>
      <div class="flex flex-col">
        <span class="text-white text-lg font-medium drop-shadow-md"
          >{callState.remoteContact?.name ?? "Unknown"}</span
        >
        <span class="text-white/80 text-sm drop-shadow-md"
          >{callState.durationFormatted}</span
        >
      </div>
    </div>
  {:else}
    <!-- Audio Mode: Center Avatar & Name -->
    <div
      class="flex flex-col items-center z-10 transition-opacity duration-300 opacity-100 mt-16"
    >
      <div
        class="w-24 h-24 rounded-full bg-[#3a3a3a] flex items-center justify-center text-white text-4xl font-semibold mb-4 shadow-2xl ring-4 ring-white/10"
      >
        {callState.remoteContact?.name?.substring(0, 1) ?? "?"}
      </div>

      <h1
        class="text-[34px] font-semibold text-white tracking-tight mb-1"
        style:text-shadow="0 2px 10px rgba(0,0,0,0.5)"
      >
        {callState.remoteContact?.name ?? "Unknown"}
      </h1>

      <p
        class="text-[17px] text-white/90 tabular-nums mb-8"
        style:text-shadow="0 1px 5px rgba(0,0,0,0.5)"
      >
        {callState.durationFormatted}
      </p>
    </div>
  {/if}

  <!-- Controls -->
  {#if callState.isVideo}
    <!-- FaceTime Bottom Panel -->
    <div
      class="absolute bottom-8 left-4 right-4 bg-[#2a2a2a]/80 backdrop-blur-xl rounded-[32px] p-6 z-50 transition-opacity duration-300 {showControls
        ? 'opacity-100'
        : 'opacity-0 pointer-events-none'}"
      role="presentation"
      onclick={handleStopPropagation}
      onkeydown={handleStopPropagationKeydown}
    >
      <div class="flex justify-between items-center mb-6 px-2">
        <button class="flex flex-col items-center gap-1 opacity-50"
          ><Star size={24} color="white" /><span
            class="text-[10px] text-white font-medium mt-1">effects</span
          ></button
        >
        <button
          onclick={handleToggleMute}
          class="flex flex-col items-center gap-1 {callState.isMuted
            ? 'opacity-100'
            : 'opacity-50'} transition-opacity"
        >
          {#if callState.isMuted}
            <MicOff size={24} color="white" />
          {:else}
            <Mic size={24} color="white" />
          {/if}
          <span class="text-[10px] text-white font-medium mt-1">mute</span>
        </button>
        <button class="flex flex-col items-center gap-1 opacity-50"
          ><RefreshCcw size={24} color="white" /><span
            class="text-[10px] text-white font-medium mt-1">flip</span
          ></button
        >
        <button
          onclick={handleHangUp}
          class="w-12 h-12 rounded-full bg-ios-red flex items-center justify-center hover:opacity-80 active:scale-95 transition-all"
          ><PhoneOff size={20} color="white" /></button
        >
      </div>
      <div class="flex gap-4">
        <button
          onclick={handleToggleVideo}
          class="flex-1 py-3.5 rounded-2xl bg-white/10 flex items-center justify-center gap-2 text-sm text-white font-medium active:scale-95 transition-all"
        >
          <VideoOff size={18} /> Camera Off
        </button>
        <button
          onclick={handleToggleSpeaker}
          class="flex-1 py-3.5 rounded-2xl {callState.isSpeaker
            ? 'bg-white text-black'
            : 'bg-white/10 text-white'} flex items-center justify-center gap-2 text-sm font-medium active:scale-95 transition-all"
        >
          <Volume2 size={18} /> Speaker
        </button>
      </div>
    </div>
  {:else}
    <!-- Audio Mode Controls -->
    <div
      class="grid grid-cols-3 gap-x-6 gap-y-5 px-8 mb-auto z-10 transition-opacity duration-300 opacity-100"
      role="presentation"
      onclick={handleStopPropagation}
      onkeydown={handleStopPropagationKeydown}
    >
      {#each controls as c (c.id || c)}
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
          <span class="text-[13px] text-white/90 font-medium drop-shadow-md"
            >{c.label}</span
          >
        </button>
      {/each}
    </div>

    <!-- Audio Mode Hang Up -->
    <div
      class="pb-16 z-10 transition-opacity duration-300 opacity-100"
      role="presentation"
      onclick={handleStopPropagation}
      onkeydown={handleStopPropagationKeydown}
    >
      <button
        onclick={handleHangUp}
        class="w-[72px] h-[72px] rounded-full bg-ios-red flex items-center justify-center shadow-lg shadow-red-900/50 active:opacity-80 active:scale-95 transition-all text-white"
        aria-label="hang up"
      >
        <PhoneOff size={32} />
      </button>
    </div>
  {/if}
</div>
