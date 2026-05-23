export class AppCameraState {
  videoEl: HTMLVideoElement | undefined = $state(undefined);
  photoTaken = $state(false);
  photoUrl = $state('');
  stream: MediaStream | null = $state(null);
  mode: 'video' | 'photo' | 'portrait' = $state('photo');
  facingMode: 'user' | 'environment' = $state('environment');
  modes: ('video' | 'photo' | 'portrait')[] = ['video', 'photo', 'portrait'];

  constructor() {}

  async startCamera() {
    try {
      if (this.stream) this.stream.getTracks().forEach(t => t.stop());
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this.facingMode } });
      if (this.videoEl) { this.videoEl.srcObject = this.stream; }
    } catch { /* camera not available */ }
  }

  stopCamera() {
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
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
