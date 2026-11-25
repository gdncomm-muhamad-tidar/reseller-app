<script setup lang="ts">
import { computed } from 'vue';

/** 3D illustration, Figma "mi.* background=true": 36 frame, bg tile at inset 9.38% (radius 9.75),
 *  source drawn ~1.5x the frame, centred. */
const props = withDefaults(defineProps<{ src: string; size?: number; scale?: number; bg?: boolean }>(), { size: 36, scale: 1.5, bg: true });
const k = computed(() => props.size / 36);
const img = computed(() => props.size * props.scale);
</script>

<template>
  <div class="mi" :style="{ width: size + 'px', height: size + 'px' }">
    <div v-if="bg" class="mi__bg" :style="{ width: 29.25 * k + 'px', height: 29.25 * k + 'px', borderRadius: 9.75 * k + 'px' }" />
    <img :src="src" :style="{ width: img + 'px', height: img + 'px' }" alt="" draggable="false" />
  </div>
</template>

<style scoped lang="scss">
.mi { position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; flex: none; }
.mi__bg { position: absolute; background: linear-gradient(180deg, $blu-color-info-background-low, $blu-color-info-background-default); }
.mi img { position: absolute; object-fit: contain; }
</style>
