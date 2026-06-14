import { systemGlobalState } from "$lib/os/states/systemGlobalState.svelte";
import { dialogGlobalState } from "$lib/os/states/dialogGlobalState.svelte";
import { webrtcGlobalState } from "$lib/os/states/webrtcGlobalState.svelte";
import { SettingsApiClient } from "$lib/client/services/SettingsApiClient";

export class LinkedDevicesAppState {
  devices = $state<any[]>([]);
  isLoading = $state(true);

  async fetchDevices() {
    this.isLoading = true;
    try {
      if (!systemGlobalState.currentUser?.id) return;
      const data = await SettingsApiClient.getDevices(systemGlobalState.currentUser.id);
      if (data.devices) {
        this.devices = data.devices;
      }
    } catch (e: any) {
      dialogGlobalState.show({ 
        title: 'Device Error', 
        message: e.message || 'Failed to fetch devices', 
        confirmText: 'OK' 
      });
    } finally {
      this.isLoading = false;
    }
  }

  async revokeDevice(deviceId: string) {
    try {
      // Optimistic update
      this.devices = this.devices.filter((d) => d.device_id !== deviceId);

      if (!systemGlobalState.currentUser?.id) return;
      await SettingsApiClient.revokeDevice(systemGlobalState.currentUser.id, deviceId);

      // Send force_logout broadcast so the other tab logs out immediately
      webrtcGlobalState.sendSignal(
        systemGlobalState.currentUser?.id!,
        "force_logout",
        {},
        deviceId,
      );
    } catch (e) {
      // Revert if failed
      await this.fetchDevices();
    }
  }
}
