<script setup lang="ts">
import { computed } from 'vue';

/** Background layer of the hero: moves at `speed` x scroll (parallax) and stretches on pull-down. */
const props = withDefaults(defineProps<{ scrollY: number; speed?: number }>(), { speed: 0.5 });
const ty = computed(() => (props.scrollY > 0 ? props.scrollY * props.speed : props.scrollY));
</script>

<template>
  <div class="pbg" :style="{ transform: `translateY(${ty}px)` }"><slot /></div>
</template>

<style scoped lang="scss">
.pbg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; will-change: transform; }
</style>
