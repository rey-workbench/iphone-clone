export type CallStatus = 'idle' | 'calling' | 'incoming' | 'active';

import type { ISignalingPayload } from '$lib/framework/types/apps/phone';

export interface ISignalCallback {
	onOffer: (payload: ISignalingPayload) => void;
	onAnswer: (payload: ISignalingPayload) => void;
	onIceCandidate: (payload: ISignalingPayload) => void;
	onEnd: () => void;
	onAnsweredElsewhere: (payload: unknown) => void;
}

export interface IWebrtcGlobalState {
	localStream: MediaStream | null;
	remoteStream: MediaStream | null;

	setupSignaling(callbacks: ISignalCallback): void;
	waitForSubscription(timeout?: number): Promise<boolean>;
	sendSignal(
		toUserId: string,
		event: string,
		payload?: unknown,
		toDeviceId?: string
	): Promise<void>;

	getLocalStream(withVideo?: boolean): Promise<MediaStream>;
	createPeerConnection(
		toUserId: string,
		toDeviceId?: string,
		onDisconnect?: () => void
	): Promise<RTCPeerConnection>;

	createOffer(toUserId: string, payloadParams?: any): Promise<RTCSessionDescriptionInit>;
	setRemoteOffer(
		offer: RTCSessionDescriptionInit,
		toUserId: string,
		toDeviceId: string
	): Promise<void>;
	setRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<void>;
	addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;

	setMuted(muted: boolean): void;
	setSpeakerVolume(loud: boolean): void;
	toggleVideo(enable: boolean): Promise<boolean>;
	cleanup(): void;
}
