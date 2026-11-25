<script setup lang="ts">
import type { ArtName } from '@/icons';
withDefaults(defineProps<{ name: ArtName; width: number; height?: number }>(), {});
</script>

<template>
  <img :src="`/icons/${name}.svg`" :width="width" :height="height ?? width" alt="" class="app-art" draggable="false" />
</template>

<style scoped lang="scss">
.app-art { display: block; flex: none; }
</style>
