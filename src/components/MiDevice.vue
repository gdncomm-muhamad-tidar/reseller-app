<script setup lang="ts">
import { computed } from 'vue';
import { IMG } from '@/data';

/** Figma mi.device: phone render + screen glare (40px). */
const props = withDefaults(defineProps<{ size?: number }>(), { size: 40 });
const k = computed(() => props.size / 40);
</script>

<template>
  <div class="md" :style="{ width: size + 'px', height: size + 'px' }">
    <img :src="IMG.phone" alt="" draggable="false" :style="{ left: -9.67 * k + 'px', top: -8.67 * k + 'px', width: 57 * k + 'px', height: 57 * k + 'px' }" />
    <svg :width="15.1 * k" :height="27.9 * k" viewBox="0 0 18.1331 33.4341" preserveAspectRatio="none" :style="{ left: 12.14 * k + 'px', top: 7 * k + 'px' }">
      <defs>
        <linearGradient id="md-glare" x1="9.41" y1="-1.57" x2="9.41" y2="31.26" gradientUnits="userSpaceOnUse"><stop stop-color="#fff" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></linearGradient>
      </defs>
      <path d="M0 20.1994L16.0134 0L18.1331 13.6444L2.22656 33.4341L0 20.1994Z" fill="url(#md-glare)" />
    </svg>
  </div>
</template>

<style scoped lang="scss">
.md { position: relative; overflow: hidden; flex: none; img, svg { position: absolute; } }
</style>
