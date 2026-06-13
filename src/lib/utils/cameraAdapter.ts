export interface ICameraHardware {
  getStream(facingMode: 'user' | 'environment'): Promise<MediaStream>;
}

export class WebCameraAdapter implements ICameraHardware {
  async getStream(facingMode: 'user' | 'environment'): Promise<MediaStream> {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode }
    });
  }
}

export class MockCameraAdapter implements ICameraHardware {
  async getStream(facingMode: 'user' | 'environment'): Promise<MediaStream> {
    // Return a dummy canvas stream for preview/testing environments
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#fff';
      ctx.font = '24px sans-serif';
      ctx.fillText(`Mock Camera (${facingMode})`, 50, 100);
    }
    // We cast this stream to MediaStream
    return (canvas as any).captureStream ? (canvas as any).captureStream(30) : new MediaStream();
  }
}
