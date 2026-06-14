export type CallStatus = 'idle' | 'calling' | 'incoming' | 'active';

import type { ISignalingPayload } from '../apps/phone';

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
	createPeerConnection(onDisconnect: () => void): Promise<RTCPeerConnection>;
	setIceCandidateCallback(cb: (c: RTCIceCandidate) => void): void;
	addLocalTracksToPc(): void;

	createOffer(): Promise<RTCSessionDescriptionInit>;
	setRemoteOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit>;
	setRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<void>;
	addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;

	setMuted(muted: boolean): void;
	setSpeakerVolume(loud: boolean): void;
	toggleVideo(enable: boolean, toUserId: string, toDeviceId?: string): Promise<boolean>;
	cleanup(): void;
}
