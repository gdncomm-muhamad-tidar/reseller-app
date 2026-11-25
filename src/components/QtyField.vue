<script setup lang="ts">
import AppIcon from './AppIcon.vue';

/** input-number.field (small, secondary): - qty + */
const props = defineProps<{ qty: number }>();
const emit = defineEmits<{ (e: 'change', q: number): void }>();
</script>

<template>
  <div class="qty">
    <button type="button" aria-label="Kurangi" class="qty__b" @click="emit('change', props.qty - 1)"><AppIcon name="minus" :size="18" color="var(--blu-color-info-icon-default, #0072ff)" /></button>
    <span class="qty__v t-s2">{{ qty }}</span>
    <button type="button" aria-label="Tambah" class="qty__b" @click="emit('change', props.qty + 1)"><AppIcon name="plus" :size="18" color="var(--blu-color-info-icon-default, #0072ff)" /></button>
  </div>
</template>

<style scoped lang="scss">
.qty { display: flex; align-items: center; gap: 4px; width: 112px; height: 36px; border: 1px solid $blu-color-neutral-border-default; border-radius: 8px; background: $blu-color-neutral-background-default; }
.qty__b { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; padding: 0; cursor: pointer; }
.qty__v { flex: 1; text-align: center; }
</style>
