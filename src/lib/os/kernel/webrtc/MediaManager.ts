import { requestMicrophone, requestCamera } from '$lib/os/services/permissions';

export class MediaManager {
	private localStream: MediaStream | null = null;

	async getLocalStream(withVideo: boolean = false): Promise<MediaStream> {
		if (!this.localStream) {
			const hasPerm = await requestMicrophone();
			if (!hasPerm) {
				throw new Error('Microphone permission denied');
			}
			if (withVideo) {
				const hasCameraPerm = await requestCamera();
				if (!hasCameraPerm) {
					throw new Error('Camera permission denied by user.');
				}
			}
			this.localStream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: withVideo
			});
		}
		return this.localStream;
	}

	setMuted(muted: boolean) {
		this.localStream?.getAudioTracks().forEach((t) => (t.enabled = !muted));
	}

	setSpeakerVolume(loud: boolean) {
		const audio = document.getElementById('remote-audio') as HTMLAudioElement;
		if (audio) audio.volume = loud ? 1 : 0.8;
	}

	async enableVideo(): Promise<MediaStreamTrack | null> {
		if (!this.localStream) return null;
		try {
			const hasCameraPerm = await requestCamera();
			if (!hasCameraPerm) return null;

			const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
			const videoTrack = videoStream.getVideoTracks()[0];

			this.localStream.addTrack(videoTrack);
			return videoTrack;
		} catch {
			return null;
		}
	}

	disableVideo(): MediaStreamTrack | null {
		if (!this.localStream) return null;
		const videoTrack = this.localStream.getVideoTracks()[0];
		if (videoTrack) {
			videoTrack.stop();
			this.localStream.removeTrack(videoTrack);
			return videoTrack;
		}
		return null;
	}

	getStream(): MediaStream | null {
		return this.localStream;
	}

	cleanup() {
		if (this.localStream) {
			this.localStream.getTracks().forEach((t) => t.stop());
			this.localStream = null;
		}
	}
}
