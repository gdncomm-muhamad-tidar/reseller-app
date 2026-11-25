<script setup lang="ts">
import BliLoaderSkeleton from '@blibli/blue.loader-skeleton/dist/loader-skeleton/blue/LoaderSkeleton';

/** Skeleton block (BLUE loader-skeleton). w: px number or CSS string; h px; r radius px. */
const props = withDefaults(defineProps<{ w?: number | string; h?: number; r?: number }>(), { w: '100%', h: 12, r: 6 });
const css = (v: number | string) => (typeof v === 'number' ? v + 'px' : v);
</script>

<template>
  <div class="bone" :style="{ width: css(props.w), height: props.h + 'px', borderRadius: props.r + 'px' }">
    <BliLoaderSkeleton width="100%" height="100%" />
  </div>
</template>

<style scoped lang="scss">
.bone { overflow: hidden; flex: none; max-width: 100%; }
</style>
