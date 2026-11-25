<script setup lang="ts">
import { computed } from 'vue';
import { ICONS, type IconName } from '@/icons';

const props = withDefaults(defineProps<{ name: IconName; size?: number; color?: string }>(), { size: 20, color: 'var(--blu-color-neutral-icon-default, #797f85)' });
const comp = computed(() => ICONS[props.name]);
</script>

<template>
  <!-- BLUE system icons use fill="currentColor"; colour is driven via CSS color -->
  <component :is="comp" :width="size" :height="size" :style="{ color }" class="app-icon" />
</template>

<style scoped lang="scss">
.app-icon { flex: none; display: inline-block; }
</style>
