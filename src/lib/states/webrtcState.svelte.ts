import { supabase } from '$lib/config/supabase';
import { systemState } from '$lib/states/systemState.svelte';

export type CallStatus = 'idle' | 'calling' | 'incoming' | 'active';

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ]
};

type SignalCallback = {
    onOffer: (payload: any) => void;
    onAnswer: (payload: any) => void;
    onIceCandidate: (payload: any) => void;
    onEnd: () => void;
};

/**
 * WebRTCState — pure WebRTC + Supabase signaling layer.
 * Has no UI state (no status, contact, timer).
 * CallState sits above this and drives the UI.
 */
export class WebRTCState {
    private pc: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private channel: any = null;
    private callbacks: SignalCallback | null = null;

    // ─── Setup ────────────────────────────────────────────────────────────────

    private isSubscribed = false;

    setupSignaling(callbacks: SignalCallback) {
        this.callbacks = callbacks;
        const user = systemState.currentUser;
        if (!user) {
            const unsub = $effect.root(() => {
                $effect(() => {
                    if (systemState.currentUser) {
                        this.setupSignaling(callbacks);
                        unsub();
                    }
                });
            });
            return;
        }

        const handleIfForMe = (payload: any, cb: (p: any) => void) => {
            console.log('[WebRTC] Received broadcast:', payload);
            if (payload.to === systemState.currentUser?.id) {
                cb(payload);
            }
        };

        this.channel = supabase.channel('global-call-signaling', {
            config: {
                broadcast: { ack: true }
            }
        })
            .on('broadcast', { event: 'call_offer' },     ({ payload }: any) => handleIfForMe(payload, callbacks.onOffer))
            .on('broadcast', { event: 'call_answer' },    ({ payload }: any) => handleIfForMe(payload, callbacks.onAnswer))
            .on('broadcast', { event: 'ice_candidate' },  ({ payload }: any) => handleIfForMe(payload, callbacks.onIceCandidate))
            .on('broadcast', { event: 'call_end' },       ({ payload }: any) => handleIfForMe(payload, callbacks.onEnd))
            .subscribe((status: string) => {
                console.log('[WebRTC] Supabase channel status:', status);
                if (status === 'SUBSCRIBED') {
                    this.isSubscribed = true;
                } else {
                    this.isSubscribed = false;
                }
            });
    }

    async waitForSubscription(timeout = 5000): Promise<boolean> {
        if (this.isSubscribed) return true;
        return new Promise((resolve) => {
            let elapsed = 0;
            const interval = setInterval(() => {
                if (this.isSubscribed) {
                    clearInterval(interval);
                    resolve(true);
                }
                elapsed += 100;
                if (elapsed >= timeout) {
                    clearInterval(interval);
                    resolve(false);
                }
            }, 100);
        });
    }

    async sendSignal(toUserId: string, event: string, payload: any = {}) {
        const ready = await this.waitForSubscription();
        if (!this.channel || !ready) {
            console.warn('[WebRTC] Cannot send signal, channel not subscribed yet');
            return;
        }
        console.log(`[WebRTC] Sending ${event} to ${toUserId}`);
        const resp = await this.channel.send({
            type: 'broadcast',
            event,
            payload: { ...payload, to: toUserId }
        });
        console.log('[WebRTC] Send response:', resp);
    }

    // ─── Peer Connection ──────────────────────────────────────────────────────

    async createPeerConnection(onDisconnect: () => void): Promise<RTCPeerConnection> {
        this.pc = new RTCPeerConnection(ICE_SERVERS);

        this.pc.onicecandidate = async (event) => {
            // Caller side — forward ICE candidates to remote
            // remoteId is managed by CallState which will bind this via sendSignal directly
            if (event.candidate) {
                this.pendingIceCallback?.(event.candidate);
            }
        };

        this.pc.ontrack = (event) => {
            const audio = document.getElementById('remote-audio') as HTMLAudioElement;
            if (audio) {
                audio.srcObject = event.streams[0];
                audio.play().catch(console.error);
            }
        };

        this.pc.onconnectionstatechange = () => {
            const state = this.pc?.connectionState;
            if (state === 'failed' || state === 'disconnected' || state === 'closed') {
                onDisconnect();
            }
        };

        return this.pc;
    }

    // ICE callback wired after connection setup
    private pendingIceCallback: ((c: RTCIceCandidate) => void) | null = null;

    setIceCandidateCallback(cb: (c: RTCIceCandidate) => void) {
        this.pendingIceCallback = cb;
    }

    async getLocalStream(): Promise<MediaStream> {
        if (!this.localStream) {
            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        }
        return this.localStream;
    }

    addLocalTracksToPc() {
        if (!this.pc || !this.localStream) return;
        this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!));
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
        return answer;
    }

    async setRemoteAnswer(answer: RTCSessionDescriptionInit) {
        if (!this.pc) throw new Error('No peer connection');
        await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async addIceCandidate(candidate: RTCIceCandidateInit) {
        if (!this.pc) return;
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    }

    // ─── Controls ─────────────────────────────────────────────────────────────

    setMuted(muted: boolean) {
        this.localStream?.getAudioTracks().forEach(t => t.enabled = !muted);
    }

    setSpeakerVolume(loud: boolean) {
        const audio = document.getElementById('remote-audio') as HTMLAudioElement;
        if (audio) audio.volume = loud ? 1 : 0.8;
    }

    // ─── Cleanup ──────────────────────────────────────────────────────────────

    cleanup() {
        this.pc?.close();
        this.pc = null;
        this.localStream?.getTracks().forEach(t => t.stop());
        this.localStream = null;
        this.pendingIceCallback = null;
    }
}

export const webrtcState = new WebRTCState();
