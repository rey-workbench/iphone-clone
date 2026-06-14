import { systemGlobalState, webrtcGlobalState, type CallStatus } from '$lib/os/state';
import { dialogGlobalState } from '$lib/os/state/dialogGlobalState.svelte';
import { BaseGlobalState } from '$lib/os/state/baseGlobalState.svelte';
import type { IContact, ISignalingPayload } from '$lib/framework/types';

class CallAppState extends BaseGlobalState {
	appName = 'Call';
	status = $state<CallStatus>('idle');
	remoteContact = $state<IContact | null>(null);
	duration = $state(0);
	isMuted = $state(false);
	isSpeaker = $state(false);
	isLocalVideo = $state(false);
	isRemoteVideo = $state(false);

	isVideo = $derived(this.isLocalVideo || this.isRemoteVideo);

	direction = $state<'incoming' | 'outgoing' | null>(null);

	private timer: ReturnType<typeof setInterval> | null = null;
	private pendingOffer: RTCSessionDescriptionInit | null = null;
	private remoteDeviceId: string | null = null;
	private initialized = false;

	constructor() {
		super();
	}

	async init() {
		if (typeof window !== 'undefined' && !this.initialized) {
			this.initialized = true;
			webrtcGlobalState.setupSignaling({
				onOffer: (payload) => this.handleOffer(payload),
				onAnswer: (payload) => this.handleAnswer(payload),
				onIceCandidate: (payload: ISignalingPayload) => this.handleIceCandidate(payload),
				onEnd: () => this.handleRemoteEnd(),
				onAnsweredElsewhere: () => this.handleAnsweredElsewhere()
			});

			window.addEventListener('reyos:remote_video', () => {
				this.isRemoteVideo = true;
				// Force reactivity update for the video tag
				const stream = webrtcGlobalState.remoteStream;
				webrtcGlobalState.remoteStream = null;
				setTimeout(() => (webrtcGlobalState.remoteStream = stream), 10);
			});
		}
	}

	// ─── Call Flow ────────────────────────────────────────────────────────────

	async initiateCall(contact: IContact) {
		const user = systemGlobalState.currentUser;
		if (!user || this.status !== 'idle') return;

		this.remoteContact = contact;
		this.status = 'calling';
		this.direction = 'outgoing';

		try {
			await webrtcGlobalState.getLocalStream();
			await webrtcGlobalState.createPeerConnection(() => this.cleanup());

			webrtcGlobalState.setIceCandidateCallback(async (candidate) => {
				if (this.remoteContact) {
					await webrtcGlobalState.sendSignal(
						this.remoteContact.id,
						'ice_candidate',
						{ candidate },
						this.remoteDeviceId || undefined
					);
				}
			});

			webrtcGlobalState.addLocalTracksToPc();

			const offer = await webrtcGlobalState.createOffer();

			await webrtcGlobalState.sendSignal(contact.id, 'call_offer', {
				offer,
				from: { id: user.id, name: user.name }
			});
		} catch (e: unknown) {
			dialogGlobalState.show({
				title: 'Call Error',
				message: (e as Error).message || 'Failed to initiate call',
				confirmText: 'OK'
			});
			this.cleanup();
		}
	}

	private async handleOffer(payload: ISignalingPayload) {
		if (this.status !== 'idle') {
			const isSameContact =
				this.remoteContact &&
				payload.from &&
				(this.remoteContact.id === payload.from.id ||
					this.remoteContact.username === payload.from.username);

			if (isSameContact) {
				// Renegotiation for video
				try {
					if (payload.offer) {
						const answer = await webrtcGlobalState.setRemoteOffer(payload.offer);
						await webrtcGlobalState.sendSignal(
							this.remoteContact!.id,
							'call_answer',
							{ answer },
							this.remoteDeviceId || undefined
						);
					}
				} catch {
					/* renegotiation failed, ignore */
				}
				return;
			}

			// If it's a different contact trying to call while we are busy, tell them we are busy
			if (payload.from && payload.from.id) {
				await webrtcGlobalState.sendSignal(payload.from.id, 'call_end');
			}
			return;
		}

		this.remoteContact = payload.from as IContact;
		this.remoteDeviceId = payload.fromDeviceId || null;
		this.pendingOffer = payload.offer || null;
		this.status = 'incoming';
		this.direction = 'incoming';
	}

	async acceptCall() {
		if (this.status !== 'incoming' || !this.pendingOffer || !this.remoteContact) return;
		this.status = 'active';
		this.startTimer();

		try {
			await webrtcGlobalState.getLocalStream();
			await webrtcGlobalState.createPeerConnection(() => this.cleanup());

			webrtcGlobalState.setIceCandidateCallback(async (candidate) => {
				if (this.remoteContact) {
					await webrtcGlobalState.sendSignal(
						this.remoteContact.id,
						'ice_candidate',
						{ candidate },
						this.remoteDeviceId || undefined
					);
				}
			});

			webrtcGlobalState.addLocalTracksToPc();

			const answer = await webrtcGlobalState.setRemoteOffer(this.pendingOffer);

			await webrtcGlobalState.sendSignal(
				this.remoteContact.id,
				'call_answer',
				{ answer },
				this.remoteDeviceId || undefined
			);

			// Tell other tabs on our account to stop ringing
			if (systemGlobalState.currentUser) {
				await webrtcGlobalState.sendSignal(
					systemGlobalState.currentUser.id,
					'call_answered_elsewhere'
				);
			}

			this.pendingOffer = null;
		} catch (e: unknown) {
			dialogGlobalState.show({
				title: 'Call Error',
				message: (e as Error).message || 'Failed to accept call',
				confirmText: 'OK'
			});
			this.cleanup();
		}
	}

	async declineCall() {
		if (!this.remoteContact) return;
		await webrtcGlobalState.sendSignal(
			this.remoteContact.id,
			'call_end',
			{},
			this.remoteDeviceId || undefined
		);

		if (systemGlobalState.currentUser) {
			await webrtcGlobalState.sendSignal(
				systemGlobalState.currentUser.id,
				'call_answered_elsewhere'
			);
		}
		this.cleanup();
	}

	async hangUp() {
		if (!this.remoteContact) return;
		await webrtcGlobalState.sendSignal(
			this.remoteContact.id,
			'call_end',
			{},
			this.remoteDeviceId || undefined
		);
		this.cleanup();
	}

	private async handleAnswer(payload: ISignalingPayload) {
		try {
			this.remoteDeviceId = payload.fromDeviceId || null;
			if (payload.answer) {
				await webrtcGlobalState.setRemoteAnswer(payload.answer);
			}
			this.status = 'active';
			this.startTimer();
		} catch {
			/* answer handling failed, ignore */
		}
	}

	private async handleIceCandidate(payload: ISignalingPayload) {
		if (!payload.candidate) return;
		try {
			await webrtcGlobalState.addIceCandidate(payload.candidate);
		} catch {
			/* ICE candidate failed, ignore */
		}
	}

	private handleRemoteEnd() {
		this.cleanup();
	}

	private handleAnsweredElsewhere() {
		if (this.status === 'incoming') {
			this.cleanup();
		}
	}

	// ─── Controls ─────────────────────────────────────────────────────────────

	toggleMute() {
		this.isMuted = !this.isMuted;
		webrtcGlobalState.setMuted(this.isMuted);
	}

	toggleSpeaker() {
		this.isSpeaker = !this.isSpeaker;
		webrtcGlobalState.setSpeakerVolume(this.isSpeaker);
	}

	async toggleVideo() {
		if (!this.remoteContact) return;
		const willEnable = !this.isLocalVideo;
		const success = await webrtcGlobalState.toggleVideo(
			willEnable,
			this.remoteContact.id,
			this.remoteDeviceId || undefined
		);
		if (success) {
			this.isLocalVideo = willEnable;
		}
	}

	get localStream() {
		return webrtcGlobalState.localStream;
	}

	get remoteStream() {
		return webrtcGlobalState.remoteStream;
	}

	// ─── Timer ────────────────────────────────────────────────────────────────

	private startTimer() {
		this.duration = 0;
		if (this.timer) clearInterval(this.timer);
		this.timer = setInterval(() => {
			this.duration++;
		}, 1000);
	}

	get durationFormatted(): string {
		const m = Math.floor(this.duration / 60)
			.toString()
			.padStart(2, '0');
		const s = (this.duration % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	}

	// ─── Cleanup ──────────────────────────────────────────────────────────────

	private async cleanup() {
		// Save to history before clearing
		if (this.remoteContact && this.direction) {
			let type: 'incoming' | 'outgoing' | 'missed';
			if (this.status === 'incoming' && this.duration === 0) {
				type = 'missed';
			} else if (this.status === 'calling' && this.duration === 0) {
				type = 'outgoing'; // or missed outgoing, but let's stick to outgoing
			} else {
				type = this.direction;
			}

			const { saveCallHistory } = await import('$lib/framework/db');
			await saveCallHistory({
				id: crypto.randomUUID(),
				contact_id: this.remoteContact.id,
				contact_name: this.remoteContact.name,
				type,
				timestamp: Date.now(),
				duration: this.duration,
				is_video: this.isVideo
			});

			// Reload recents if phone app is open
			// Since PhoneAppState is instanced, we can emit an event or just let it reload when opened
			if (typeof window !== 'undefined') {
				window.dispatchEvent(new CustomEvent('reyos:call_ended'));
			}
		}

		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		webrtcGlobalState.cleanup();
		this.status = 'idle';
		this.remoteContact = null;
		this.remoteDeviceId = null;
		this.pendingOffer = null;
		this.duration = 0;
		this.isMuted = false;
		this.isLocalVideo = false;
		this.isRemoteVideo = false;
		this.direction = null;
	}
}

export const callState = new CallAppState();
