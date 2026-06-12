<script lang="ts">
  import type { Snippet } from 'svelte';

  let { 
    children, 
    class: extraClass = "mb-5",
    bgClass = "bg-ios-bg2"
  } = $props<{ 
    children: Snippet, 
    class?: string,
    bgClass?: string 
  }>();
</script>

<div class="{bgClass} rounded-xl {extraClass} overflow-hidden">
  {@render children()}
</div>
