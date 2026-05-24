import { systemState } from '$lib/states/systemState.svelte';
import { webrtcState, type CallStatus } from '$lib/states/webrtcState.svelte';

export class CallState {
    status = $state<CallStatus>('idle');
    remoteContact = $state<any>(null);
    duration = $state(0);
    isMuted = $state(false);
    isSpeaker = $state(false);
    isVideo = $state(false);
    direction = $state<'incoming' | 'outgoing' | null>(null);

    private timer: ReturnType<typeof setInterval> | null = null;
    private pendingOffer: RTCSessionDescriptionInit | null = null;
    private remoteDeviceId: string | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            webrtcState.setupSignaling({
                onOffer: (payload) => this.handleOffer(payload),
                onAnswer: (payload) => this.handleAnswer(payload),
                onIceCandidate: (payload) => this.handleIceCandidate(payload),
                onEnd: () => this.handleRemoteEnd(),
                onAnsweredElsewhere: () => this.handleAnsweredElsewhere()
            });

            window.addEventListener('reynisa:remote_video', () => {
                this.isVideo = true;
                // Force reactivity update for the video tag
                const stream = webrtcState.remoteStream;
                webrtcState.remoteStream = null;
                setTimeout(() => webrtcState.remoteStream = stream, 10);
            });
        }
    }

    // ─── Call Flow ────────────────────────────────────────────────────────────

    async initiateCall(contact: any) {
        const user = systemState.currentUser;
        if (!user || this.status !== 'idle') return;

        this.remoteContact = contact;
        this.status = 'calling';
        this.direction = 'outgoing';

        try {
            await webrtcState.getLocalStream();
            await webrtcState.createPeerConnection(() => this.cleanup());
            
            webrtcState.setIceCandidateCallback(async (candidate) => {
                if (this.remoteContact) {
                    await webrtcState.sendSignal(this.remoteContact.id, 'ice_candidate', { candidate }, this.remoteDeviceId || undefined);
                }
            });

            webrtcState.addLocalTracksToPc();

            const offer = await webrtcState.createOffer();

            await webrtcState.sendSignal(contact.id, 'call_offer', {
                offer,
                from: { id: user.id, name: user.name }
            });
        } catch (e: any) {
            console.error('Failed to initiate call:', e);
            alert(`Call failed: ${e.message || 'Check microphone permissions'}`);
            this.cleanup();
        }
    }

    private async handleOffer(payload: any) {
        if (this.status !== 'idle') {
            if (this.remoteContact && this.remoteContact.id === payload.from.id) {
                // Renegotiation for video
                try {
                    const answer = await webrtcState.setRemoteOffer(payload.offer);
                    await webrtcState.sendSignal(this.remoteContact.id, 'call_answer', { answer }, this.remoteDeviceId || undefined);
                } catch (e) {
                    console.error('Failed to renegotiate:', e);
                }
                return;
            }

            await webrtcState.sendSignal(payload.from.id, 'call_end');
            return;
        }

        this.remoteContact = payload.from;
        this.remoteDeviceId = payload.fromDeviceId;
        this.pendingOffer = payload.offer;
        this.status = 'incoming';
        this.direction = 'incoming';
    }

    async acceptCall() {
        if (this.status !== 'incoming' || !this.pendingOffer || !this.remoteContact) return;
        this.status = 'active';
        this.startTimer();

        try {
            await webrtcState.getLocalStream();
            await webrtcState.createPeerConnection(() => this.cleanup());

            webrtcState.setIceCandidateCallback(async (candidate) => {
                if (this.remoteContact) {
                    await webrtcState.sendSignal(this.remoteContact.id, 'ice_candidate', { candidate }, this.remoteDeviceId || undefined);
                }
            });

            webrtcState.addLocalTracksToPc();

            const answer = await webrtcState.setRemoteOffer(this.pendingOffer);

            await webrtcState.sendSignal(this.remoteContact.id, 'call_answer', { answer }, this.remoteDeviceId || undefined);
            
            // Tell other tabs on our account to stop ringing
            if (systemState.currentUser) {
                await webrtcState.sendSignal(systemState.currentUser.id, 'call_answered_elsewhere');
            }

            this.pendingOffer = null;
        } catch (e: any) {
            console.error('Failed to accept call:', e);
            alert(`Call failed: ${e.message}`);
            this.cleanup();
        }
    }

    async declineCall() {
        if (!this.remoteContact) return;
        await webrtcState.sendSignal(this.remoteContact.id, 'call_end', {}, this.remoteDeviceId || undefined);
        
        if (systemState.currentUser) {
            await webrtcState.sendSignal(systemState.currentUser.id, 'call_answered_elsewhere');
        }
        this.cleanup();
    }

    async hangUp() {
        if (!this.remoteContact) return;
        await webrtcState.sendSignal(this.remoteContact.id, 'call_end', {}, this.remoteDeviceId || undefined);
        this.cleanup();
    }

    private async handleAnswer(payload: any) {
        try {
            this.remoteDeviceId = payload.fromDeviceId;
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

    private handleAnsweredElsewhere() {
        if (this.status === 'incoming') {
            this.cleanup();
        }
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

    async toggleVideo() {
        if (!this.remoteContact) return;
        const willEnable = !this.isVideo;
        const success = await webrtcState.toggleVideo(willEnable, this.remoteContact.id, this.remoteDeviceId || undefined);
        if (success) {
            this.isVideo = willEnable;
        }
    }

    get localStream() {
        return webrtcState.localStream;
    }

    get remoteStream() {
        return webrtcState.remoteStream;
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

            const { saveCallHistory } = await import('$lib/config/localdb');
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
            // Since PhoneState is instanced, we can emit an event or just let it reload when opened
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('reynisa:call_ended'));
            }
        }

        if (this.timer) { clearInterval(this.timer); this.timer = null; }
        webrtcState.cleanup();
        this.status = 'idle';
        this.remoteContact = null;
        this.remoteDeviceId = null;
        this.pendingOffer = null;
        this.duration = 0;
        this.isMuted = false;
        this.isVideo = false;
        this.direction = null;
    }
}

export const callState = new CallState();
