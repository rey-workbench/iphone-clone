import { supabase } from '$lib/config/supabase';
import { systemState } from '$lib/states/systemState.svelte';
import { Permissions } from '$lib/utils/permissions';

export type CallStatus = 'idle' | 'calling' | 'incoming' | 'active';

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.l.google.com:5349' },
        { urls: 'stun:stun1.l.google.com:3478' },
        { urls: 'stun:stun1.l.google.com:5349' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:5349' },
        { urls: 'stun:stun3.l.google.com:3478' },
        { urls: 'stun:stun3.l.google.com:5349' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:5349' }
    ]
};

type SignalCallback = {
    onOffer: (payload: any) => void;
    onAnswer: (payload: any) => void;
    onIceCandidate: (payload: any) => void;
    onEnd: () => void;
    onAnsweredElsewhere: (payload: any) => void;
};

/**
 * WebRTCState — Pure WebRTC & Supabase signaling layer.
 * Focuses only on connection logic, devoid of UI states.
 */
export class WebRTCState {
    // ─── Core WebRTC ──────────────────────────────────────────────────────────
    private pc: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private iceQueue: RTCIceCandidateInit[] = [];
    private pendingIceCallback: ((c: RTCIceCandidate) => void) | null = null;

    // ─── Signaling (Supabase) ─────────────────────────────────────────────────
    private channel: any = null;
    private callbacks: SignalCallback | null = null;
    private isSubscribed = false;

    // ============================================================================
    // 1. SIGNALING SETUP
    // ============================================================================

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
                // If it's targeted to a specific device, only process if it matches our deviceId
                if (payload.toDeviceId && payload.toDeviceId !== systemState.deviceId) {
                    return;
                }
                cb(payload);
            }
        };

        this.channel = supabase.channel('global-call-signaling', {
            config: { broadcast: { ack: true } }
        })
            .on('broadcast', { event: 'call_offer' },     ({ payload }: any) => handleIfForMe(payload, callbacks.onOffer))
            .on('broadcast', { event: 'call_answer' },    ({ payload }: any) => handleIfForMe(payload, callbacks.onAnswer))
            .on('broadcast', { event: 'ice_candidate' },  ({ payload }: any) => handleIfForMe(payload, callbacks.onIceCandidate))
            .on('broadcast', { event: 'call_end' },       ({ payload }: any) => handleIfForMe(payload, callbacks.onEnd))
            .on('broadcast', { event: 'call_answered_elsewhere' }, ({ payload }: any) => handleIfForMe(payload, callbacks.onAnsweredElsewhere))
            .on('broadcast', { event: 'force_logout' }, ({ payload }: any) => {
                if (payload.to === systemState.currentUser?.id && payload.toDeviceId === systemState.deviceId) {
                    console.warn('[System] Received force_logout. Logging out...');
                    localStorage.removeItem('reynisa_currentUser');
                    window.location.reload();
                }
            })
            .subscribe((status: string) => {
                console.log('[WebRTC] Supabase channel status:', status);
                this.isSubscribed = status === 'SUBSCRIBED';
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

    async sendSignal(toUserId: string, event: string, payload: any = {}, toDeviceId?: string) {
        const ready = await this.waitForSubscription();
        if (!this.channel || !ready) {
            console.warn('[WebRTC] Cannot send signal, channel not subscribed yet');
            return;
        }

        console.log(`[WebRTC] Sending ${event} to ${toUserId}`);
        await this.channel.send({
            type: 'broadcast',
            event,
            payload: { 
                ...payload, 
                to: toUserId,
                toDeviceId,
                fromDeviceId: systemState.deviceId 
            }
        });
    }

    // ============================================================================
    // 2. MEDIA DEVICE SETUP
    // ============================================================================

    async getLocalStream(): Promise<MediaStream> {
        if (!this.localStream) {
            const hasPerm = await Permissions.requestMicrophone();
            if (!hasPerm) {
                throw new Error("Microphone permission denied by user.");
            }
            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        }
        return this.localStream;
    }

    // ============================================================================
    // 3. WEBRTC PEER CONNECTION
    // ============================================================================

    async createPeerConnection(onDisconnect: () => void): Promise<RTCPeerConnection> {
        this.pc = new RTCPeerConnection(ICE_SERVERS);

        this.pc.onicecandidate = async (event) => {
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
            console.log('[WebRTC] Connection state changed to:', state);
            if (state === 'failed' || state === 'disconnected' || state === 'closed') {
                onDisconnect();
            }
        };

        this.pc.oniceconnectionstatechange = () => {
            console.log('[WebRTC] ICE Connection state:', this.pc?.iceConnectionState);
        };

        return this.pc;
    }

    setIceCandidateCallback(cb: (c: RTCIceCandidate) => void) {
        this.pendingIceCallback = cb;
    }

    addLocalTracksToPc() {
        if (!this.pc || !this.localStream) return;
        this.localStream.getTracks().forEach(t => this.pc!.addTrack(t, this.localStream!));
    }

    // ============================================================================
    // 4. WEBRTC SIGNALING LOGIC (SDP & ICE)
    // ============================================================================

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
            console.warn('[WebRTC] Ignoring duplicate/invalid answer. Current state:', this.pc.signalingState);
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
                await this.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
            }
        }
    }

    // ============================================================================
    // 5. MEDIA CONTROLS & CLEANUP
    // ============================================================================

    setMuted(muted: boolean) {
        this.localStream?.getAudioTracks().forEach(t => t.enabled = !muted);
    }

    setSpeakerVolume(loud: boolean) {
        const audio = document.getElementById('remote-audio') as HTMLAudioElement;
        if (audio) audio.volume = loud ? 1 : 0.8;
    }

    cleanup() {
        this.pc?.close();
        this.pc = null;
        this.localStream?.getTracks().forEach(t => t.stop());
        this.localStream = null;
        this.pendingIceCallback = null;
        this.iceQueue = [];
    }
}

export const webrtcState = new WebRTCState();
