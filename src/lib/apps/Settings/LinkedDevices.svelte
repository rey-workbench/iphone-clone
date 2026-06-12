<script lang="ts">
  import { ChevronLeft, Laptop, Smartphone, Monitor } from "@lucide/svelte";
  import { systemState } from "$lib/states/systemState.svelte";
  import { onMount } from "svelte";
  import Skeleton from "$lib/components/ui/Skeleton.svelte";
  import { AppLinkedDevicesState } from "./LinkedDevicesState.svelte";

  let { onBack } = $props<{ onBack: () => void }>();

  const state = new AppLinkedDevicesState();

  onMount(async () => {
    await state.fetchDevices();
  });

  function getDeviceIcon(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes("iphone") || lower.includes("android"))
      return Smartphone;
    if (
      lower.includes("mac") ||
      lower.includes("windows") ||
      lower.includes("linux")
    )
      return Laptop;
    return Monitor;
  }

  function formatDate(isoString: string) {
    const date = new Date(isoString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col absolute inset-0 z-50">
  <div class="px-2 flex items-center h-11 relative">
    <button
      class="absolute left-2 flex items-center text-ios-blue text-[17px] bg-transparent border-none cursor-pointer"
      onclick={onBack}
    >
      <ChevronLeft size={22} class="-ml-1" />
      Settings
    </button>
    <h1 class="text-[17px] font-semibold flex-1 text-center text-white">
      Linked Devices
    </h1>
  </div>

  <div class="flex-1 overflow-y-auto px-4 pt-6">
    <div class="mb-2 text-[13px] text-ios-label2 uppercase ml-2">
      Active Sessions
    </div>
    <div class="bg-ios-bg2 rounded-xl mb-5 overflow-hidden">
      {#if state.isLoading}
        {#each Array(3) as _, i}
          <div class="flex items-center gap-3 py-3 px-4 w-full">
            <div class="w-10 h-10 rounded-md shrink-0">
              <Skeleton width="100%" height="100%" borderRadius="6px" />
            </div>
            <div class="flex-1 flex flex-col gap-1.5">
              <Skeleton width="60%" height="18px" />
              <Skeleton width="40%" height="14px" />
            </div>
            <Skeleton width="70px" height="28px" borderRadius="9999px" />
          </div>
          {#if i < 2}<div class="h-px bg-ios-sep ml-[68px]"></div>{/if}
        {/each}
      {:else if state.devices.length === 0}
        <div class="p-4 text-center text-ios-label2">
          No linked devices found.
        </div>
      {:else}
        {#each state.devices as device, i}
          {@const isCurrent = device.device_id === systemState.deviceId}
          {@const Icon = getDeviceIcon(device.device_name)}
          <div class="flex items-center gap-3 py-3 px-4 w-full text-left">
            <div
              class="w-10 h-10 rounded-md bg-[#39393D] flex items-center justify-center shrink-0 text-white"
            >
              <Icon size={24} />
            </div>
            <div class="flex-1">
              <div class="text-[17px] text-white font-medium">
                {device.device_name}
                {isCurrent ? "(This Device)" : ""}
              </div>
              <div class="text-[14px] text-ios-label2">
                Last active: {formatDate(device.last_active)}
              </div>
            </div>
            {#if !isCurrent}
              <button
                class="px-3 py-1.5 rounded-full bg-ios-red/20 text-ios-red text-[14px] font-medium active:bg-ios-red/30 border-none cursor-pointer"
                onclick={() => state.revokeDevice(device.device_id)}
              >
                Log Out
              </button>
            {:else}
              <div class="text-[14px] text-ios-green font-medium">Active</div>
            {/if}
          </div>
          {#if i < state.devices.length - 1}
            <div class="h-px bg-ios-sep ml-[68px]"></div>
          {/if}
        {/each}
      {/if}
    </div>
    <div class="mt-2 text-[13px] text-ios-label2 ml-2">
      You can review and revoke access to devices that are currently logged into
      your account.
    </div>
  </div>
</div>
