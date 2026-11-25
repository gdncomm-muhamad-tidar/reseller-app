<script setup lang="ts">
import { useStore } from '@/store';
import AppIcon from './AppIcon.vue';

/** "Tambah" on product cards: adds 1 unit to the cart (the floating cart bar appears). */
const props = defineProps<{ id: string }>();
const { addToCart } = useStore();
</script>

<template>
  <button class="add" type="button" aria-label="Tambah" @click.stop="addToCart(props.id, 1)">
    <AppIcon name="plus" :size="18" color="var(--blu-color-info-icon-default, #0072ff)" />
  </button>
</template>

<style scoped lang="scss">
.add {
  position: absolute; right: 8px; top: 76px; width: 36px; height: 36px; border-radius: 18px; background: $blu-color-neutral-background-default;
  border: 1px solid $blu-color-info-background-med; display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer;
  transition: transform 0.12s;
  &:active { transform: scale(0.92); }
}
</style>
