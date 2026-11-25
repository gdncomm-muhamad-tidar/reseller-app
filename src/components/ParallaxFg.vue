<script setup lang="ts">
import { computed } from 'vue';

/** Content of the hero drifts up a little slower and fades as it leaves (parallax foreground). */
const props = defineProps<{ scrollY: number; threshold: number }>();
const p = computed(() => Math.max(0, Math.min(1, props.scrollY / Math.max(1, props.threshold))));
</script>

<template>
  <div :style="{ opacity: 1 - 0.65 * p, transform: `translateY(${p * threshold * 0.25}px)` }"><slot /></div>
</template>
