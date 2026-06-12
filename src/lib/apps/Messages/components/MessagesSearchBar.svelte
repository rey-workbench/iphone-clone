<script lang="ts">
  import { Mic } from "@lucide/svelte";
</script>

<div class="px-4 mb-4">
  <div class="bg-ios-bg2 rounded-[10px] flex items-center px-2 py-1.5 gap-1.5">
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8E8E93"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      ><circle cx="11" cy="11" r="8"></circle><line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
      ></line></svg
    >
    <input
      type="text"
      class="bg-transparent border-none outline-none text-white text-[17px] w-full placeholder:text-ios-gray"
      placeholder="Search"
    />
    <button
      class="bg-transparent border-none p-0 cursor-pointer flex items-center justify-center"
    >
      <Mic size={16} color="#8E8E93" />
    </button>
  </div>
</div>
