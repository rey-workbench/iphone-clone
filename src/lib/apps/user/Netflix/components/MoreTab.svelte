<script lang="ts">
	import { Settings, User, HelpCircle } from '@lucide/svelte';
	import { systemGlobalState } from '$lib/os/state';
</script>

<div class="w-full h-full pt-16 px-4">
	<div class="flex items-center gap-4 mb-4">
		<div class="w-16 h-16 rounded overflow-hidden">
			<img
				src="https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-88wkdmjrorckekha.jpg"
				alt="Profile"
				class="w-full h-full object-cover"
			/>
		</div>
		<div class="flex flex-col justify-center">
			<h2 class="text-xl font-bold">
				{systemGlobalState.currentUser?.name ||
					systemGlobalState.currentUser?.username ||
					'My Profile'}
			</h2>
			<button
				class="text-xs text-gray-400 bg-transparent border-none text-left p-0 mt-1 cursor-pointer font-medium"
				>Manage Profiles</button
			>
		</div>
	</div>

	<div class="w-full h-[1px] bg-[#333] mb-4"></div>

	<div class="flex flex-col gap-1">
		<button
			class="flex items-center gap-4 bg-[#1e1e1e] hover:bg-[#2a2a2a] p-4 rounded-lg border-none text-white cursor-pointer text-left w-full transition-colors"
		>
			<Settings size={24} class="text-[#a6a6a6]" />
			<span class="text-[15px] font-medium flex-1">App Settings</span>
			<svg class="text-[#a6a6a6] w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
				><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
				></path></svg
			>
		</button>
		<button
			class="flex items-center gap-4 bg-[#1e1e1e] hover:bg-[#2a2a2a] p-4 rounded-lg border-none text-white cursor-pointer text-left w-full transition-colors"
		>
			<User size={24} class="text-[#a6a6a6]" />
			<span class="text-[15px] font-medium flex-1">Account</span>
			<svg class="text-[#a6a6a6] w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
				><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
				></path></svg
			>
		</button>
		<button
			class="flex items-center gap-4 bg-[#1e1e1e] hover:bg-[#2a2a2a] p-4 rounded-lg border-none text-white cursor-pointer text-left w-full transition-colors"
		>
			<HelpCircle size={24} class="text-[#a6a6a6]" />
			<span class="text-[15px] font-medium flex-1">Help</span>
			<svg class="text-[#a6a6a6] w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
				><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
				></path></svg
			>
		</button>
	</div>
</div>
