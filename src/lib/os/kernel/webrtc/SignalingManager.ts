import { supabase } from '$lib/backend/config/supabase';
import { systemGlobalState } from '$lib/os/state/systemGlobalState.svelte';
import type { ISignalCallback } from '$lib/os/types/os/webrtc';

export class SignalingManager {
	private channel: any = null;
	private isSubscribed = false;

	setupSignaling(callbacks: ISignalCallback) {
		const user = systemGlobalState.currentUser;
		if (!user) {
			// If user is not ready yet, wait and retry.
			// In Svelte 5, $effect.root can be used or we can just rely on the caller to guarantee user exists.
			// But for safety, we expose this logic:
			throw new Error('SignalingManager requires a logged in user');
		}

		const handleIfForMe = (payload: any, cb?: (p: any) => void) => {
			if (!cb) return;
			if (payload.to === systemGlobalState.currentUser?.id) {
				if (payload.toDeviceId && payload.toDeviceId !== systemGlobalState.deviceId) {
					return;
				}
				cb(payload);
			}
		};

		this.channel = supabase
			.channel('global-call-signaling', {
				config: { broadcast: { ack: true } }
			})
			.on('broadcast', { event: 'call_offer' }, ({ payload }: any) =>
				handleIfForMe(payload, callbacks.onOffer)
			)
			.on('broadcast', { event: 'call_answer' }, ({ payload }: any) =>
				handleIfForMe(payload, callbacks.onAnswer)
			)
			.on('broadcast', { event: 'ice_candidate' }, ({ payload }: any) =>
				handleIfForMe(payload, callbacks.onIceCandidate)
			)
			.on('broadcast', { event: 'call_end' }, ({ payload }: any) =>
				handleIfForMe(payload, callbacks.onEnd)
			)
			.on('broadcast', { event: 'call_answered_elsewhere' }, ({ payload }: any) =>
				handleIfForMe(payload, callbacks.onAnsweredElsewhere)
			)
			.on('broadcast', { event: 'force_logout' }, ({ payload }: any) => {
				if (
					payload.to === systemGlobalState.currentUser?.id &&
					payload.toDeviceId === systemGlobalState.deviceId
				) {
					localStorage.removeItem('reyos_currentUser');
					window.location.reload();
				}
			})
			.subscribe((status: string) => {
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
			return;
		}

		await this.channel.send({
			type: 'broadcast',
			event,
			payload: {
				...payload,
				to: toUserId,
				toDeviceId,
				fromDeviceId: systemGlobalState.deviceId
			}
		});
	}

	cleanup() {
		if (this.channel) {
			this.channel.unsubscribe();
			this.channel = null;
		}
		this.isSubscribed = false;
	}
}
