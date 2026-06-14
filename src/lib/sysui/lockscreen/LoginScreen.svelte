<script lang="ts">
	import { systemGlobalState, authGlobalState } from '$lib/core/states';
	import { LoaderCircle, ChevronLeft, Handshake } from '@lucide/svelte';

	async function handleLogin() {
		const user = await authGlobalState.login();
		if (user) {
			systemGlobalState.currentUser = user;
			systemGlobalState.saveUser();
		}
	}

	const handleUsernameKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') document.getElementById('password')?.focus();
	};

	const handlePasswordKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') handleLogin();
	};
</script>

<div class="absolute inset-0 z-60 bg-white flex flex-col font-sans">
	<!-- Top Bar -->
	<div class="w-full h-13.5"></div>
	<!-- Status bar placeholder -->
	<div class="w-full flex items-center px-2 h-11">
		<button class="flex items-center text-[#c7c7cc] bg-transparent border-none text-[17px]">
			<ChevronLeft size={24} />
			<span>Back</span>
		</button>
	</div>

	<div
		class="flex-1 w-full max-w-85 mx-auto flex flex-col items-center animate-[fadeIn_0.3s_ease-out] px-4 pt-4 pb-8"
	>
		<!-- Logo area -->
		<div class="relative flex items-center justify-center w-28 h-28 mb-4">
			<img src="/assets/icon.svg" alt="iCloud Logo" class="w-full h-full object-contain" />
		</div>

		<h1 class="text-[28px] font-semibold text-black mb-2 text-center tracking-tight">iCloud</h1>
		<p class="text-[15px] text-[#333] text-center mb-8 px-4 leading-snug">
			Sign in with your iCloud Apple ID.
		</p>

		<!-- Inputs Box -->
		<div class="w-full bg-[#f2f2f7] rounded-[10px] overflow-hidden mb-4">
			<input
				id="username"
				name="username"
				type="text"
				placeholder="Apple ID"
				bind:value={authGlobalState.username}
				class="w-full h-12.5 bg-transparent border-b border-[#d1d1d6] px-4 outline-none text-[17px] text-black"
				onkeydown={handleUsernameKeydown}
			/>
			<input
				id="password"
				name="password"
				type="password"
				placeholder="Password"
				bind:value={authGlobalState.password}
				disabled={authGlobalState.isLoading}
				onkeydown={handlePasswordKeydown}
				class="w-full h-12.5 px-4 text-[17px] text-black bg-transparent border-none outline-none placeholder:text-[#8e8e93] disabled:opacity-50"
			/>
		</div>

		{#if authGlobalState.errorMsg}
			<div class="text-[#ff3b30] text-[13px] text-center mb-4 px-4 animate-[fadeIn_0.3s_ease-out]">
				{authGlobalState.errorMsg}
			</div>
		{/if}

		<button class="bg-transparent border-none text-[#8e8e93] text-[15px] cursor-pointer mb-auto">
			Forgot Password or Apple ID?
		</button>

		<!-- Privacy Section -->
		<div class="flex flex-col items-center mt-12 mb-8">
			<Handshake size={32} color="#1C37CA" fill="#1C37CA" class="mb-3" />
			<p class="text-[11px] text-[#8e8e93] text-center leading-tight">
				Your Apple ID information is used to enable Apple services when you sign in, including
				iCloud Backup, which automatically backs up the data on your device in case you need to
				replace or restore it. Your device serial number may be used to check eligibility for
				service offers. <span class="text-[#1C37CA]">See how your data is managed...</span>
			</p>
		</div>

		<!-- Submit Button (Pill) -->
		<button
			class="w-full h-12.5 rounded-xl flex items-center justify-center transition-colors mb-6 {authGlobalState.username &&
			authGlobalState.password
				? 'bg-[#1C37CA] text-white'
				: 'bg-[#f2f2f7] text-[#c7c7cc]'}"
			disabled={!authGlobalState.username || !authGlobalState.password || authGlobalState.isLoading}
			onclick={handleLogin}
		>
			{#if authGlobalState.isLoading}
				<LoaderCircle size={24} class="animate-spin text-[#8e8e93]" />
			{:else}
				<span class="text-[17px] font-medium">Continue</span>
			{/if}
		</button>

		<!-- Bottom link -->
		<button class="bg-transparent border-none text-[#8e8e93] text-[15px] cursor-pointer pb-4">
			Use Another Device to Sign In
		</button>
	</div>
</div>
