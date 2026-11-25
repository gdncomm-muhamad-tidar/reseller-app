<script setup lang="ts">
import { IMG } from '@/data';

/** Figma "mi.trophy": cup + check badge, transparent. */
defineProps<{ size: number }>();
</script>

<template>
  <div class="tr" :style="{ width: size + 'px', height: size + 'px' }">
    <img :src="IMG.trophy0" alt="" draggable="false" :style="{ left: 0, top: size * 0.023 + 'px', width: size + 'px', height: size + 'px' }" />
    <img :src="IMG.trophyCheck" alt="" draggable="false" :style="{ left: size * 0.4844 + 'px', top: size * 0.5 + 'px', width: size * 0.5 + 'px', height: size * 0.5 + 'px' }" />
  </div>
</template>

<style scoped lang="scss">
.tr { position: relative; flex: none; img { position: absolute; } }
</style>
