import { WebRTCApiClient } from '$lib/framework/api/services/WebRTCApiClient';

export class PeerConnectionManager {
	private pc: RTCPeerConnection | null = null;
	private iceQueue: RTCIceCandidateInit[] = [];
	private pendingIceCallback: ((c: RTCIceCandidate) => void) | null = null;
	private onRemoteStream: ((stream: MediaStream) => void) | null = null;

	async createPeerConnection(
		onDisconnect: () => void,
		onRemoteStreamCb: (stream: MediaStream) => void
	): Promise<RTCPeerConnection> {
		const config = await WebRTCApiClient.getTurnCredentials();
		this.pc = new RTCPeerConnection(config);
		this.onRemoteStream = onRemoteStreamCb;
		const remoteStream = new MediaStream();

		this.pc.onicecandidate = async (event) => {
			if (event.candidate) {
				this.pendingIceCallback?.(event.candidate);
			}
		};

		this.pc.ontrack = (event) => {
			remoteStream.addTrack(event.track);
			if (event.track.kind === 'video') {
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new CustomEvent('reyos:remote_video'));
				}
			}

			if (event.track.kind === 'audio') {
				const audio = document.getElementById('remote-audio') as HTMLAudioElement;
				if (audio) {
					if (!audio.srcObject) audio.srcObject = new MediaStream();
					(audio.srcObject as MediaStream).addTrack(event.track);
					audio.play().catch(() => {});
				}
			}

			// Notify parent about stream updates
			this.onRemoteStream?.(remoteStream);
		};

		this.pc.onconnectionstatechange = () => {
			const state = this.pc?.connectionState;
			if (state === 'failed' || state === 'closed') {
				onDisconnect();
			}
		};

		return this.pc;
	}

	setIceCandidateCallback(cb: (c: RTCIceCandidate) => void) {
		this.pendingIceCallback = cb;
	}

	addTrack(track: MediaStreamTrack, stream: MediaStream) {
		if (!this.pc) return;
		this.pc.addTrack(track, stream);
	}

	removeTrack(track: MediaStreamTrack) {
		if (!this.pc) return;
		const sender = this.pc.getSenders().find((s) => s.track === track);
		if (sender) this.pc.removeTrack(sender);
	}

	addAllTracks(stream: MediaStream) {
		if (!this.pc) return;
		stream.getTracks().forEach((t) => this.pc!.addTrack(t, stream));
	}

	async createOffer(): Promise<RTCSessionDescriptionInit> {
		if (!this.pc) throw new Error('No peer connection');
		const offer = await this.pc.createOffer();
		await this.pc.setLocalDescription(offer);
		return offer;
	}

	async setRemoteOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
		if (!this.pc) throw new Error('No peer connection');
		await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
		const answer = await this.pc.createAnswer();
		await this.pc.setLocalDescription(answer);
		await this.flushIceQueue();
		return answer;
	}

	async setRemoteAnswer(answer: RTCSessionDescriptionInit) {
		if (!this.pc) throw new Error('No peer connection');
		if (this.pc.signalingState !== 'have-local-offer') {
			return;
		}
		await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
		await this.flushIceQueue();
	}

	async addIceCandidate(candidate: RTCIceCandidateInit) {
		if (!this.pc || !this.pc.remoteDescription) {
			this.iceQueue.push(candidate);
			return;
		}
		await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
	}

	private async flushIceQueue() {
		if (!this.pc || !this.pc.remoteDescription) return;
		while (this.iceQueue.length > 0) {
			const candidate = this.iceQueue.shift();
			if (candidate) {
				await this.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
			}
		}
	}

	cleanup() {
		if (this.pc) {
			this.pc.close();
			this.pc = null;
		}
		this.pendingIceCallback = null;
		this.onRemoteStream = null;
		this.iceQueue = [];
	}
}
