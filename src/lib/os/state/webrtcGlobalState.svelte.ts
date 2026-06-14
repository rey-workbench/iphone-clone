import { BaseGlobalState } from './baseGlobalState.svelte';
import { SignalingManager } from '../kernel/webrtc/SignalingManager';
import { MediaManager } from '../kernel/webrtc/MediaManager';
import { PeerConnectionManager } from '../kernel/webrtc/PeerConnectionManager';

import type { ISignalCallback, IWebrtcGlobalState } from '../types/os/webrtc';

export type { CallStatus } from '../types/os/webrtc';

class WebrtcGlobalState extends BaseGlobalState implements IWebrtcGlobalState {
	appName = 'WebRTCKernel';

	private signaling: SignalingManager;
	private media: MediaManager;
	private peerConnection: PeerConnectionManager;

	remoteStream = $state<MediaStream | null>(null);

	constructor() {
		super();
		this.signaling = new SignalingManager();
		this.media = new MediaManager();
		this.peerConnection = new PeerConnectionManager();
	}

	// ============================================================================
	// 1. SIGNALING
	// ============================================================================
	setupSignaling(callbacks: ISignalCallback) {
		this.signaling.setupSignaling(callbacks);
	}

	async waitForSubscription(timeout = 5000): Promise<boolean> {
		return await this.signaling.waitForSubscription(timeout);
	}

	async sendSignal(toUserId: string, event: string, payload: any = {}, toDeviceId?: string) {
		await this.signaling.sendSignal(toUserId, event, payload, toDeviceId);
	}

	// ============================================================================
	// 2. MEDIA
	// ============================================================================
	get localStream() {
		return this.media.getStream();
	}

	async getLocalStream(withVideo: boolean = false): Promise<MediaStream> {
		return await this.media.getLocalStream(withVideo);
	}

	setMuted(muted: boolean) {
		this.media.setMuted(muted);
	}

	setSpeakerVolume(loud: boolean) {
		this.media.setSpeakerVolume(loud);
	}

	async toggleVideo(enable: boolean) {
		if (enable) {
			const track = await this.media.enableVideo();
			if (track) {
				const stream = this.media.getStream();
				if (stream) {
					this.peerConnection.addTrack(track, stream);
				}
				return true;
			}
			return false;
		} else {
			const track = this.media.disableVideo();
			if (track) {
				this.peerConnection.removeTrack(track);
			}
			return true;
		}
	}

	// ============================================================================
	// 3. PEER CONNECTION
	// ============================================================================
	async createPeerConnection(toUserId: string, toDeviceId?: string, onDisconnect?: () => void): Promise<RTCPeerConnection> {
		const pc = await this.peerConnection.createPeerConnection(
			() => {
				this.cleanup();
				onDisconnect?.();
			},
			(stream) => { this.remoteStream = stream; }
		);

		this.peerConnection.setIceCandidateCallback((candidate) => {
			this.sendSignal(
				toUserId,
				'ice_candidate',
				{ candidate: candidate.toJSON() },
				toDeviceId
			);
		});

		const localStream = this.media.getStream();
		if (localStream) {
			this.peerConnection.addAllTracks(localStream);
		}

		return pc;
	}

	async createOffer(toUserId: string, payloadParams: any = {}): Promise<RTCSessionDescriptionInit> {
		const offer = await this.peerConnection.createOffer();
		await this.sendSignal(toUserId, 'call_offer', { offer, ...payloadParams });
		return offer;
	}

	async setRemoteOffer(offer: RTCSessionDescriptionInit, toUserId: string, toDeviceId: string) {
		const answer = await this.peerConnection.setRemoteOffer(offer);
		await this.sendSignal(toUserId, 'call_answer', { answer }, toDeviceId);
	}

	async setRemoteAnswer(answer: RTCSessionDescriptionInit) {
		await this.peerConnection.setRemoteAnswer(answer);
	}

	async addIceCandidate(candidate: RTCIceCandidateInit) {
		await this.peerConnection.addIceCandidate(candidate);
	}

	// ============================================================================
	// 4. CLEANUP
	// ============================================================================
	cleanup() {
		this.signaling.cleanup();
		this.media.cleanup();
		this.peerConnection.cleanup();
		this.remoteStream = null;

		const audio = document.getElementById('remote-audio') as HTMLAudioElement;
		if (audio) {
			audio.srcObject = null;
			audio.pause();
		}
	}

	async onSuspend() {
		// Clean up WebRTC on suspend
		this.cleanup();
	}
}

export const webrtcGlobalState = new WebrtcGlobalState();
