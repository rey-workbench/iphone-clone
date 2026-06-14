import { requestCamera } from "$lib/utils/permissions";
import type { IAppLifecycle } from "$lib/types/app";
import type { TCameraMode } from "$lib/types";
import { WebCameraAdapter, MockCameraAdapter, type ICameraHardware } from "$lib/utils/cameraAdapter";
import { BaseGlobalState } from "$lib/os/states/baseGlobalState.svelte";

export class CameraAppState extends BaseGlobalState implements IAppLifecycle {
  appName = 'Camera';
  isForeground = $state(false);

  photoTaken = $state(false);
  photoUrl = $state('');
  stream: MediaStream | null = $state(null);
  mode: TCameraMode = $state('photo');
  facingMode: 'user' | 'environment' = $state('environment');
  modes: TCameraMode[] = ['video', 'photo', 'portrait', 'pano'];

  private hardware: ICameraHardware;

  constructor(isPreview = false) {
    super();
    this.hardware = isPreview ? new MockCameraAdapter() : new WebCameraAdapter();
  }

  async onLaunch() {
    this.isForeground = true;
    await this.startCamera();
  }

  onSuspend() {
    this.isForeground = false;
    this.stopCamera();
  }

  onResume() {
    this.isForeground = true;
    this.startCamera();
  }

  onDestroy() {
    this.isForeground = false;
    this.stopCamera();
  }

  async startCamera() {
    try {
      if (this.stream) this.stream.getTracks().forEach(t => t.stop());
      
      const hasPerm = await requestCamera();
      if (!hasPerm) {
         // console.warn("Camera permission denied.");
        return;
      }

      this.stream = await this.hardware.getStream(this.facingMode);
    } catch { /* camera not available */ }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  savePhoto(dataUrl: string) {
    this.photoUrl = dataUrl;
    this.photoTaken = true;
  }

  flipCamera() { 
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user'; 
    this.startCamera(); 
  }

  retake() { 
    this.photoTaken = false; 
    this.photoUrl = ''; 
  }
}
