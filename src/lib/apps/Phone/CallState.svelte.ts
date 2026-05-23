import { systemState } from '$lib/states/systemState.svelte';
import { webrtcState, type CallStatus } from '$lib/states/webrtcState.svelte';

export class CallState {
    status = $state<CallStatus>('idle');
    remoteContact = $state<any>(null);
    duration = $state(0);
    isMuted = $state(false);
    isSpeaker = $state(false);

    private timer: ReturnType<typeof setInterval> | null = null;
    private pendingOffer: RTCSessionDescriptionInit | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            webrtcState.setupSignaling({
                onOffer: (payload) => this.handleOffer(payload),
                onAnswer: (payload) => this.handleAnswer(payload),
                onIceCandidate: (payload) => this.handleIceCandidate(payload),
                onEnd: () => this.handleRemoteEnd()
            });
        }
    }

    // ─── Call Flow ────────────────────────────────────────────────────────────

    async initiateCall(contact: any) {
        const user = systemState.currentUser;
        if (!user || this.status !== 'idle') return;

        this.remoteContact = contact;
        this.status = 'calling';

        try {
            await webrtcState.getLocalStream();
            await webrtcState.createPeerConnection(() => this.cleanup());
            
            webrtcState.setIceCandidateCallback(async (candidate) => {
                if (this.remoteContact) {
                    await webrtcState.sendSignal(this.remoteContact.id, 'ice_candidate', { candidate });
                }
            });

            webrtcState.addLocalTracksToPc();

            const offer = await webrtcState.createOffer();

            await webrtcState.sendSignal(contact.id, 'call_offer', {
                offer,
                from: { id: user.id, name: user.name }
            });
        } catch (e) {
            console.error('Failed to initiate call:', e);
            this.cleanup();
        }
    }

    private async handleOffer(payload: any) {
        if (this.status !== 'idle') {
            await webrtcState.sendSignal(payload.from.id, 'call_end');
            return;
        }

        this.remoteContact = payload.from;
        this.pendingOffer = payload.offer;
        this.status = 'incoming';
    }

    async acceptCall() {
        if (this.status !== 'incoming' || !this.pendingOffer || !this.remoteContact) return;

        try {
            await webrtcState.getLocalStream();
            await webrtcState.createPeerConnection(() => this.cleanup());

            webrtcState.setIceCandidateCallback(async (candidate) => {
                if (this.remoteContact) {
                    await webrtcState.sendSignal(this.remoteContact.id, 'ice_candidate', { candidate });
                }
            });

            webrtcState.addLocalTracksToPc();

            const answer = await webrtcState.setRemoteOffer(this.pendingOffer);

            await webrtcState.sendSignal(this.remoteContact.id, 'call_answer', { answer });

            this.status = 'active';
            this.startTimer();
            this.pendingOffer = null;
        } catch (e) {
            console.error('Failed to accept call:', e);
            this.cleanup();
        }
    }

    async declineCall() {
        if (!this.remoteContact) return;
        await webrtcState.sendSignal(this.remoteContact.id, 'call_end');
        this.cleanup();
    }

    async hangUp() {
        if (!this.remoteContact) return;
        await webrtcState.sendSignal(this.remoteContact.id, 'call_end');
        this.cleanup();
    }

    private async handleAnswer(payload: any) {
        try {
            await webrtcState.setRemoteAnswer(payload.answer);
            this.status = 'active';
            this.startTimer();
        } catch (e) {
            console.error('Failed to set answer:', e);
        }
    }

    private async handleIceCandidate(payload: any) {
        if (!payload.candidate) return;
        try {
            await webrtcState.addIceCandidate(payload.candidate);
        } catch (e) {
            console.error('Failed to add ICE candidate:', e);
        }
    }

    private handleRemoteEnd() {
        this.cleanup();
    }

    // ─── Controls ─────────────────────────────────────────────────────────────

    toggleMute() {
        this.isMuted = !this.isMuted;
        webrtcState.setMuted(this.isMuted);
    }

    toggleSpeaker() {
        this.isSpeaker = !this.isSpeaker;
        webrtcState.setSpeakerVolume(this.isSpeaker);
    }

    // ─── Timer ────────────────────────────────────────────────────────────────

    private startTimer() {
        this.duration = 0;
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => { this.duration++; }, 1000);
    }

    get durationFormatted(): string {
        const m = Math.floor(this.duration / 60).toString().padStart(2, '0');
        const s = (this.duration % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // ─── Cleanup ──────────────────────────────────────────────────────────────

    private cleanup() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        webrtcState.cleanup();
        this.status = 'idle';
        this.remoteContact = null;
        this.pendingOffer = null;
        this.duration = 0;
        this.isMuted = false;
    }
}

export const callState = new CallState();
