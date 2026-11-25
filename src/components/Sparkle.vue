<script setup lang="ts">
/** Figma "sparkle": 4-point star, absolutely positioned. */
withDefaults(defineProps<{ size: number; x: number; y: number; color?: string }>(), { color: '#EBBF4F' });
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 14 14" :style="{ position: 'absolute', left: x + 'px', top: y + 'px' }">
    <path d="M7 0L8.48492 5.51508L14 7L8.48492 8.48492L7 14L5.51508 8.48492L0 7L5.51508 5.51508L7 0Z" :fill="color" />
  </svg>
</template>
