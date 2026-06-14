<script lang="ts">
	import { ChevronLeft } from '@lucide/svelte';
	import { MailAppState } from './MailAppState.svelte';
	import Skeleton from '$lib/sysui/ui/Skeleton.svelte';

	const state = new MailAppState();

	$effect(() => {
		state.fetchEmails();
	});

	const closeEmail = () => state.closeEmail();
	const openEmail = (e: MouseEvent) => {
		const btn = e.currentTarget as HTMLButtonElement;
		const index = parseInt(btn.dataset.index!);
		state.openEmail(state.emails[index]);
	};
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col">
	{#if state.selected}
		<div class="flex-1 flex flex-col">
			<div class="flex items-center px-4 py-2 border-b border-ios-sep">
				<button
					class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer flex items-center"
					onclick={closeEmail}
				>
					<ChevronLeft size={20} class="mr-1" /> Inbox
				</button>
			</div>
			<div class="flex-1 overflow-y-auto p-4">
				<h2 class="text-[22px] font-bold text-white mb-1">{state.selected.subject}</h2>
				<div class="flex items-center gap-2 mb-4">
					<div
						class="w-9 h-9 rounded-full bg-ios-blue flex items-center justify-center text-[14px] font-semibold text-white shrink-0"
					>
						{state.selected.from[0]}
					</div>
					<div class="flex flex-col">
						<span class="text-[15px] font-medium text-white">{state.selected.from}</span><span
							class="text-[13px] text-ios-label2">{state.selected.date}</span
						>
					</div>
				</div>
				<p class="text-[17px] text-white leading-relaxed whitespace-pre-line">
					{state.selected.body}
				</p>
			</div>
		</div>
	{:else}
		<div class="flex-1 overflow-y-auto px-4">
			<h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4">Inbox</h1>
			<div class="bg-ios-bg2 rounded-xl overflow-hidden divide-y divide-ios-sep">
				{#if state.isLoading && state.emails.length === 0}
					{#each Array(5) as _, i (i)}
						<div class="flex gap-3 p-3 px-4 w-full items-start" aria-hidden="true">
							<Skeleton width="10px" height="10px" borderRadius="9999px" class="shrink-0 mt-1.5" />
							<div class="flex-1 min-w-0">
								<div class="flex justify-between mb-1">
									<Skeleton width="100px" height="16px" />
									<Skeleton width="40px" height="12px" />
								</div>
								<Skeleton width="80%" height="16px" class="mb-1" />
								<Skeleton width="90%" height="14px" />
							</div>
						</div>
					{/each}
				{:else}
					{#each state.emails as email, i (i)}
						<button
							data-index={i}
							class="flex gap-3 p-3 px-4 w-full border-none bg-transparent cursor-pointer text-left text-white items-start"
							onclick={openEmail}
						>
							{#if !email.read}<div
									class="w-2.5 h-2.5 rounded-full bg-ios-blue shrink-0 mt-1.5"
								></div>{:else}<div class="w-2.5 shrink-0"></div>{/if}
							<div class="flex-1 min-w-0">
								<div class="flex justify-between mb-0.5">
									<span class="text-[17px] {!email.read ? 'font-semibold' : 'font-normal'}"
										>{email.from}</span
									><span class="text-[13px] text-ios-label2">{email.date}</span>
								</div>
								<div class="text-[15px] {!email.read ? 'font-semibold' : 'font-normal'} truncate">
									{email.subject}
								</div>
								<div class="text-[14px] text-ios-label2 truncate mt-0.5">{email.preview}</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>
