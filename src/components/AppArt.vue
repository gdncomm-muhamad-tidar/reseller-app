<script setup lang="ts">
import type { ArtName } from '@/icons';
const base = import.meta.env.BASE_URL;
withDefaults(defineProps<{ name: ArtName; width: number; height?: number }>(), {});
</script>

<template>
  <img :src="`${base}icons/${name}.svg`" :width="width" :height="height ?? width" alt="" class="app-art" draggable="false" />
</template>

<style scoped lang="scss">
.app-art { display: block; flex: none; }
</style>
