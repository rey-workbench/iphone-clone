import { requestCamera } from "$lib/utils/permissions";
import type { IAppLifecycle } from "$lib/types/app";
import { WebCameraAdapter, MockCameraAdapter, type ICameraHardware } from "$lib/utils/cameraAdapter";

export class AppCameraState implements IAppLifecycle {
  appName = 'Camera';
  isForeground = $state(false);

  videoEl: HTMLVideoElement | undefined = $state(undefined);
  photoTaken = $state(false);
  photoUrl = $state('');
  stream: MediaStream | null = $state(null);
  mode: 'video' | 'photo' | 'portrait' = $state('photo');
  facingMode: 'user' | 'environment' = $state('environment');
  modes: ('video' | 'photo' | 'portrait')[] = ['video', 'photo', 'portrait'];
  error: string | null = $state(null);

  private hardware: ICameraHardware;

  constructor(isPreview = false) {
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
      if (this.videoEl) { this.videoEl.srcObject = this.stream; }
    } catch { /* camera not available */ }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  capture() {
    if (!this.videoEl) return;
    const c = document.createElement('canvas'); 
    c.width = this.videoEl.videoWidth; 
    c.height = this.videoEl.videoHeight;
    c.getContext('2d')?.drawImage(this.videoEl, 0, 0);
    this.photoUrl = c.toDataURL('image/png'); 
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
