<script lang="ts">
	import { callState } from '../CallAppState.svelte';
	import { Bell, MessageSquare, PhoneOff, Phone } from '@lucide/svelte';
	let audioEl: HTMLAudioElement;

	$effect(() => {
		if (audioEl) {
			audioEl.play().catch(() => {
				/* ignore */
			});
		}
	});

	const handleDecline = () => callState.declineCall();
	const handleAccept = () => callState.acceptCall();
</script>

<!-- Incoming Ringtone -->
<audio bind:this={audioEl} src="/assets/ringtone/incoming-call.mp3" loop style:display="none"
></audio>
<!-- Full-screen overlay -->
<div
	class="absolute inset-0 z-9999 bg-[#1a1a1a] flex flex-col items-center select-none rounded-[40px] overflow-hidden"
	style:background="linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)"
>
	<!-- Top spacer -->
	<div class="h-16"></div>

	<!-- Caller Avatar -->
	<div
		class="w-24 h-24 rounded-full bg-[#3a3a3a] flex items-center justify-center text-white text-4xl font-semibold mb-4 shadow-2xl ring-4 ring-white/10"
	>
		{callState.remoteContact?.name?.substring(0, 1) ?? '?'}
	</div>

	<!-- Caller Name -->
	<h1 class="text-[34px] font-semibold text-white tracking-tight mb-1">
		{callState.remoteContact?.name ?? 'Unknown'}
	</h1>

	<!-- Status label -->
	<p class="text-[17px] text-white/60 mb-auto">incoming call</p>

	<!-- Action Buttons -->
	<div class="w-full px-12 pb-16 flex flex-col gap-6">
		<!-- Remind Me & Message row -->
		<div class="flex justify-around">
			<div class="flex flex-col items-center gap-2">
				<button
					class="w-14 h-14 rounded-full bg-[#3a3a3a] flex items-center justify-center text-white"
					aria-label="Remind Me"
				>
					<Bell size={24} />
				</button>
				<span class="text-[12px] text-white/60">Remind Me</span>
			</div>
			<div class="flex flex-col items-center gap-2">
				<button
					class="w-14 h-14 rounded-full bg-[#3a3a3a] flex items-center justify-center text-white"
					aria-label="Message"
				>
					<MessageSquare size={24} />
				</button>
				<span class="text-[12px] text-white/60">Message</span>
			</div>
		</div>

		<!-- Decline / Accept row -->
		<div class="flex justify-around items-center">
			<!-- Decline -->
			<div class="flex flex-col items-center gap-2">
				<button
					onclick={handleDecline}
					class="w-18 h-18 rounded-full bg-ios-red flex items-center justify-center shadow-lg shadow-red-900/40 active:opacity-80 transition-opacity text-white"
					aria-label="Decline"
				>
					<PhoneOff size={32} />
				</button>
				<span class="text-[14px] text-white/70 font-medium">Decline</span>
			</div>

			<!-- Accept -->
			<div class="flex flex-col items-center gap-2">
				<button
					onclick={handleAccept}
					class="w-18 h-18 rounded-full bg-ios-green flex items-center justify-center shadow-lg shadow-green-900/40 active:opacity-80 transition-opacity text-white"
					aria-label="Accept"
				>
					<Phone size={32} />
				</button>
				<span class="text-[14px] text-white/70 font-medium">Accept</span>
			</div>
		</div>
	</div>
</div>
