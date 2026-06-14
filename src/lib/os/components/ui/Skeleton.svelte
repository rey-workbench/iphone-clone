<script lang="ts">
  const {
    width = '100%',
    height = '100%',
    borderRadius = '8px',
    class: className = ''
  }: {
    width?: string;
    height?: string;
    borderRadius?: string;
    class?: string;
  } = $props();
</script>

<div
  class="animate-pulse bg-white/10 {className}"
  style:width={width} style:height={height} style:border-radius={borderRadius}
></div>
