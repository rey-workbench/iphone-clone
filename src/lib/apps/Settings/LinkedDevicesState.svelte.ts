import { systemState } from "$lib/states/systemState.svelte";
import { dialogState } from "$lib/states/dialogState.svelte";
import { webrtcState } from "$lib/states/webrtcState.svelte";
import { SettingsApiClient } from "$lib/client/services/SettingsApiClient";

export class AppLinkedDevicesState {
  devices = $state<any[]>([]);
  isLoading = $state(true);

  async fetchDevices() {
    this.isLoading = true;
    try {
      if (!systemState.currentUser?.id) return;
      const data = await SettingsApiClient.getDevices(systemState.currentUser.id);
      if (data.devices) {
        this.devices = data.devices;
      }
    } catch (e: any) {
      dialogState.show({ 
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

      if (!systemState.currentUser?.id) return;
      await SettingsApiClient.revokeDevice(systemState.currentUser.id, deviceId);

      // Send force_logout broadcast so the other tab logs out immediately
      webrtcState.sendSignal(
        systemState.currentUser?.id!,
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
