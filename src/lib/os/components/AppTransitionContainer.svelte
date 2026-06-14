<script lang="ts">
  import type { ShellState } from "../../../routes/ShellState.svelte";
  import type { Snippet } from "svelte";

  let { state, pathname, children }: { state: ShellState, pathname: string, children: Snippet } = $props();
</script>

<!-- Current App or Home Screen via SvelteKit Routing -->
<!-- We use a wrapper for the swipe-to-close effect on apps -->
<div
  class="absolute inset-0 z-50 flex flex-col {pathname !== '/' && !state.showAppSwitcher ? 'bg-black' : ''} {state.appTransition && pathname !== '/'
    ? 'animate-[appClose_0.3s_cubic-bezier(0.23,1,0.32,1)_forwards]'
    : pathname !== '/' && !state.appTransition
      ? 'animate-[appOpen_0.35s_cubic-bezier(0.23,1,0.32,1)]'
      : ''}"
  style:display={!state.showAppSwitcher ? 'flex' : 'none'}
  style:transform={pathname !== '/' && state.isAppSwiping ? `scale(${Math.max(0.465, 1 - state.appSwipeY / 500)}) translateY(-${state.appSwipeY * 0.6}px)` : (pathname !== '/' && !state.appTransition) ? 'scale(1) translateY(0)' : undefined}
  style:border-radius={pathname !== '/' && state.isAppSwiping ? `${Math.min(state.appSwipeY / 2, 48)}px` : (pathname !== '/' && !state.appTransition) ? '0' : undefined}
  style:overflow={pathname !== '/' && state.isAppSwiping ? 'hidden' : (pathname !== '/' && !state.appTransition) ? 'hidden' : undefined}
  style:transition={pathname !== '/' && state.isAppSwiping ? 'none' : (pathname !== '/' && !state.appTransition) ? 'all 0.3s cubic-bezier(0.23,1,0.32,1)' : undefined}
>
  <div class="flex-1 overflow-hidden relative flex flex-col">
    <div class="flex-1 overflow-hidden relative">
      {@render children()}
    </div>
  </div>
</div>
