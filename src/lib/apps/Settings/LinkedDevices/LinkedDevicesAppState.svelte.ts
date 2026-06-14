import { systemGlobalState } from "$lib/core/states/systemGlobalState.svelte";
import { dialogGlobalState } from "$lib/core/states/dialogGlobalState.svelte";
import { webrtcGlobalState } from "$lib/core/states/webrtcGlobalState.svelte";
import { SettingsApiClient } from "$lib/client/services/SettingsApiClient";
import type { ILinkedDevice } from '$lib/types';
import { BaseGlobalState } from '$lib/core/states/baseGlobalState.svelte';

export class LinkedDevicesAppState extends BaseGlobalState {
    appName = 'LinkedDevices';
  devices = $state<ILinkedDevice[]>([]);

  constructor() {
    super();
  }

  async fetchDevices() {
    this.setLoading(true);
    try {
      if (!systemGlobalState.currentUser?.id) return;
      const data = await SettingsApiClient.getDevices(systemGlobalState.currentUser.id);
      if (data.devices) {
        this.devices = data.devices;
      }
    } catch (e: unknown) {
      dialogGlobalState.show({ 
        title: 'Device Error', 
        message: (e as Error).message || 'Failed to fetch devices', 
        confirmText: 'OK' 
      });
    } finally {
      this.setLoading(false);
    }
  }

  async revokeDevice(deviceId: string) {
    try {
      // Optimistic update
      this.devices = this.devices.filter((d) => d.device_id !== deviceId);

      if (!systemGlobalState.currentUser?.id) return;
      await SettingsApiClient.revokeDevice(systemGlobalState.currentUser.id, deviceId);

      webrtcGlobalState.sendSignal(
        systemGlobalState.currentUser!.id,
        "force_logout",
        {},
        deviceId,
      );
    } catch {
      // Revert if failed
      await this.fetchDevices();
    }
  }
}
